package ui.Main;

import Repository.RepositoryManager;
import entity.ReservationEntity;
import observer.EventType;
import observer.Observer;
import reservation.ReservationManager;
import resource.Resource;

import javax.swing.*;
import java.awt.*;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

public class RoomTimelinePanel extends JPanel implements Observer {

  private final String[] timeSlots = {"09:00-11:00", "11:00-13:00", "13:00-15:00"};
  private DefaultListModel<String> model;
  private final ReservationManager manager = ReservationManager.getInstance();
  private JTable table;


  public RoomTimelinePanel(MainFrame frame, ReservationManager manager) {
    this.table = new JTable(3, 7);
    table.setRowHeight(40);
    add(new JScrollPane(table), BorderLayout.CENTER);

    // 🔥 Observer 등록
    manager.addObserver(this);

    setLayout(new BorderLayout());

    JLabel title = new JLabel("7일 예약 현황", SwingConstants.CENTER);
    add(title, BorderLayout.NORTH);

    JTable table = new JTable(3, 7);
    table.setRowHeight(40);

    add(new JScrollPane(table), BorderLayout.CENTER);

    JButton backBtn = new JButton("뒤로");
    add(backBtn, BorderLayout.SOUTH);


    // ============================================
    //   화면 열릴 때마다 로드
    // ============================================
    // 초기 헤더 세팅 (최초 진입 시 A/B/C 대신 날짜 표시)
    refreshTable(table);

    addComponentListener(new java.awt.event.ComponentAdapter() {
      public void componentShown(java.awt.event.ComponentEvent evt) {
        refreshTable(table);
      }
    });


    // ============================================
    //   더블클릭 이벤트
    // ============================================
    table.addMouseListener(new java.awt.event.MouseAdapter() {
      public void mouseClicked(java.awt.event.MouseEvent evt) {

        int row = table.getSelectedRow();
        int col = table.getSelectedColumn();
        if (row < 0 || col < 0) return;

        LocalDate ld = ReserveRoomPanel.selectedDate.plusDays(row * 7L + col);
        showReserveDialog(frame, table, ld);
      }
    });

    backBtn.addActionListener(e -> frame.showPanel("RESERVE_ROOM"));
  }


  // =======================
  // 날짜 비교 유틸
  // =======================
  private boolean sameDate(Date a, Date b) {
    return a.toInstant().atZone(ZoneId.systemDefault()).toLocalDate()
        .equals(b.toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
  }

  private void updateHeaders(JTable table, LocalDate startDate) {
    if (startDate == null) startDate = LocalDate.now();
    for (int col = 0; col < 7; col++) {
      LocalDate d = startDate.plusDays(col);
      table.getColumnModel().getColumn(col).setHeaderValue(d.toString());
    }
    table.getTableHeader().repaint();
  }

  private void refreshTable(JTable table) {
    RepositoryManager repo = RepositoryManager.getInstance();
    String roomName = ReserveRoomPanel.selectedRoomName;
    LocalDate startDate = ReserveRoomPanel.selectedDate != null ? ReserveRoomPanel.selectedDate : LocalDate.now();

    // 날짜 헤더
    updateHeaders(table, startDate);

    // DB 전체 예약 (달력 형태로 7x3 셀에 날짜만 표시)
    List<ReservationEntity> reservations = repo.reservations.findAll();

    // 채우기
    for (int row = 0; row < 3; row++) {
      for (int col = 0; col < 7; col++) {

        LocalDate ld = startDate.plusDays(row * 7L + col);
        Date date = Date.from(ld.atStartOfDay(ZoneId.systemDefault()).toInstant());
        String slot = timeSlots[row % timeSlots.length]; // 기존 주석 구조 유지용

        // DB에서 예약 여부 찾기 (현재 셀 날짜 기준 표시)
        List<ReservationEntity> sameDay = reservations.stream()
            .filter(r -> !r.isReturned())
            .filter(r -> r.getResourceType() != null && r.getResourceType().equals("LECTURE"))
            .filter(r -> r.getResourceName() != null && r.getResourceName().equals(roomName))
            .filter(r -> r.getStartDate() != null && sameDate(r.getStartDate(), date))
            .toList();

        String times = sameDay.stream()
            .map(r -> r.getTimeSlot() == null ? "" : r.getTimeSlot())
            .filter(s -> !s.isEmpty())
            .reduce((a, b) -> a + ", " + b)
            .orElse("");

        table.setValueAt(times.isEmpty() ? "" : times, row, col);
      }
    }

    table.getTableHeader().repaint();
  }

  private boolean tryReserve(LocalDate date, String start, String end) {
    RepositoryManager repo = RepositoryManager.getInstance();
    String roomName = ReserveRoomPanel.selectedRoomName;

    if (roomName == null || LoginPanel.currentUserId == null) {
      JOptionPane.showMessageDialog(null, "로그인 정보가 없습니다.");
      return false;
    }

    java.time.LocalTime st = java.time.LocalTime.parse(start);
    java.time.LocalTime en = java.time.LocalTime.parse(end);
    if (!en.isAfter(st)) {
      JOptionPane.showMessageDialog(null, "종료 시간이 시작 시간보다 늦어야 합니다.");
      return false;
    }

    Date startDateTime = Date.from(date.atTime(st).atZone(ZoneId.systemDefault()).toInstant());
    Date endDateTime = Date.from(date.atTime(en).atZone(ZoneId.systemDefault()).toInstant());
    String slotText = start + " ~ " + end;

    boolean overlap = repo.reservations.findAll().stream()
        .filter(r -> !r.isReturned())
        .filter(r -> r.getResourceType() != null && r.getResourceType().equals("LECTURE"))
        .filter(r -> r.getResourceName() != null && r.getResourceName().equals(roomName))
        .filter(r -> r.getStartDate() != null && r.getEndDate() != null)
        .filter(r -> sameDate(r.getStartDate(), startDateTime))
        .anyMatch(r -> {
          Date s = r.getStartDate();
          Date e = r.getEndDate();
          return s.before(endDateTime) && e.after(startDateTime);
        });

    if (overlap) {
      JOptionPane.showMessageDialog(null, "해당 시간에는 이미 예약이 있습니다.");
      return false;
    }

    ReservationEntity entity = new ReservationEntity(
        LoginPanel.currentUserId,
        LoginPanel.currentUserName,
        roomName,
        "LECTURE",
        startDateTime,
        endDateTime,
        slotText,
        null
    );
    repo.reservations.save(entity);
    return true;
  }

  // =======================
  //  날짜 선택 예약 팝업
  // =======================
  private void showReserveDialog(JFrame frame, JTable table, LocalDate date) {
    JDialog dialog = new JDialog(frame, "예약", true);
    dialog.setLayout(new BorderLayout(10, 10));
    dialog.setSize(380, 230);
    dialog.setLocationRelativeTo(frame);

    JPanel center = new JPanel(new GridBagLayout());
    center.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
    GridBagConstraints gc = new GridBagConstraints();
    gc.insets = new Insets(5,5,5,5);
    gc.fill = GridBagConstraints.HORIZONTAL;

    JLabel dateLabel = new JLabel("날짜: " + date);
    gc.gridx = 0; gc.gridy = 0; gc.gridwidth = 2;
    center.add(dateLabel, gc);

    // 09:00 ~ 20:00 한시간 단위
    DefaultComboBoxModel<String> startModel = new DefaultComboBoxModel<>();
    DefaultComboBoxModel<String> endModel = new DefaultComboBoxModel<>();
    for (int h = 9; h <= 20; h++) {
      String t = String.format("%02d:00", h);
      startModel.addElement(t);
      endModel.addElement(t);
    }
    JComboBox<String> startBox = new JComboBox<>(startModel);
    JComboBox<String> endBox = new JComboBox<>(endModel);

    gc.gridwidth = 1;
    gc.gridx = 0; gc.gridy = 1;
    center.add(new JLabel("시작 시간:"), gc);
    gc.gridx = 1;
    center.add(startBox, gc);

    gc.gridx = 0; gc.gridy = 2;
    center.add(new JLabel("종료 시간:"), gc);
    gc.gridx = 1;
    center.add(endBox, gc);

    dialog.add(center, BorderLayout.CENTER);

    JButton reserveBtn = new JButton("예약");
    JButton cancelBtn = new JButton("취소");

    JPanel bottom = new JPanel(new BorderLayout());
    JPanel left = new JPanel(new FlowLayout(FlowLayout.LEFT));
    left.add(reserveBtn);
    JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT));
    right.add(cancelBtn);
    bottom.add(left, BorderLayout.WEST);
    bottom.add(right, BorderLayout.EAST);

    dialog.add(bottom, BorderLayout.SOUTH);

    reserveBtn.addActionListener(e -> {
      String start = (String) startBox.getSelectedItem();
      String end = (String) endBox.getSelectedItem();
      boolean ok = tryReserve(date, start, end);
      if (ok) {
        JOptionPane.showMessageDialog(frame, "예약되었습니다. (" + start + " ~ " + end + ")");
        refreshTable(table);
        dialog.dispose();
      }
    });

    cancelBtn.addActionListener(e -> dialog.dispose());

    dialog.setVisible(true);
  }


  @Override
  public void update(EventType eventType) {
    if (eventType == EventType.RESOURCE_ADDED ||
            eventType == EventType.RESOURCE_REMOVED ||
            eventType == EventType.RESERVATION_CREATED) {

      refreshTable(table);
    }
  }


}
