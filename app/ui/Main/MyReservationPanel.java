package ui.Main;

import Repository.RepositoryManager;
import entity.ReservationEntity;
import observer.EventType;
import observer.Observer;
import reservation.ReservationManager;
import resource.Resource;

import javax.swing.*;
import java.awt.*;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.stream.Collectors;

public class MyReservationPanel extends JPanel implements Observer {

  private static final SimpleDateFormat DATE = new SimpleDateFormat("yyyy-MM-dd");
  private static final SimpleDateFormat DATETIME = new SimpleDateFormat("yyyy-MM-dd HH:mm");
  private DefaultListModel<String> model;
  private final ReservationManager manager = ReservationManager.getInstance();

  @Override
  public void update(EventType eventType) {
    if (eventType == EventType.RESOURCE_ADDED) {
      reloadList();
    }
  }


  private void reloadList() {
    model.clear();
    for (Resource r : manager.getAllResources()) {
      model.addElement(r.getName());
    }
  }

  public MyReservationPanel(MainFrame frame, ReservationManager manager) {
    // 🔥 Observer 등록
    manager.addObserver(this);

    setLayout(new BorderLayout());

    JLabel title = new JLabel("[내 예약 현황]", SwingConstants.CENTER);
    title.setFont(new Font("Dialog", Font.BOLD, 18));
    model = new DefaultListModel<>();
    JList<String> list = new JList<>(model);
    list.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);

    JButton refreshBtn = new JButton("새로고침");
    JButton backBtn = new JButton("뒤로 가기");
    JButton cancelBtn = new JButton("예약 취소");

    JPanel bottom = new JPanel(new FlowLayout());
    bottom.add(refreshBtn);
    bottom.add(backBtn);
    bottom.add(cancelBtn);

    add(title, BorderLayout.NORTH);
    add(new JScrollPane(list), BorderLayout.CENTER);
    add(bottom, BorderLayout.SOUTH);

    // 화면 진입 시 자동 로드
    addComponentListener(new java.awt.event.ComponentAdapter() {
      public void componentShown(java.awt.event.ComponentEvent evt) {
        reload(model);
      }
    });

    refreshBtn.addActionListener(e -> reload(model));
    backBtn.addActionListener(e -> frame.showPanel("MENU"));
    cancelBtn.addActionListener(e -> cancelSelected(model, list));

    // 더블클릭 시 상세보기/반납
    list.addMouseListener(new java.awt.event.MouseAdapter() {
      public void mouseClicked(java.awt.event.MouseEvent evt) {
        if (evt.getClickCount() == 2) {

          int idx = list.getSelectedIndex();
          if (idx < 0) return;

          List<ReservationEntity> reservations = getUserReservations();
          if (idx >= reservations.size()) return;
          ReservationEntity r = reservations.get(idx);

          if ("LECTURE".equals(r.getResourceType())) {
            showFacilityDetail(frame, r);
          } else {
            showItemDetail(frame, r);
            reload(model);  // 반납 즉시 반영
          }
        }
      }
    });
  }

  // ===========================
  //  현재 로그인 사용자의 예약만 조회
  // ===========================
  private List<ReservationEntity> getUserReservations() {

    RepositoryManager repo = RepositoryManager.getInstance();
    if (LoginPanel.currentUserId == null) return List.of();

    return repo.reservations.findAll()
        .stream()
        .filter(r -> r.getUserId() != null && r.getUserId().equals(LoginPanel.currentUserId))
        .filter(r -> !r.isReturned())
        .collect(Collectors.toList());
  }


  // ===========================
  //  목록 갱신
  // ===========================
  private void reload(DefaultListModel<String> model) {

    model.clear();

    if (LoginPanel.currentUserId == null) {
      JOptionPane.showMessageDialog(null, "로그인 후 이용해주세요.");
      return;
    }

    List<ReservationEntity> list = getUserReservations();

    for (ReservationEntity r : list) {

      String text;

      if ("LECTURE".equals(r.getResourceType())) {
        // 강의실 예약
        text = "%s | %s | %s"
            .formatted(
                r.getResourceName(),
                DATE.format(r.getStartDate()),
                r.getTimeSlot() == null ? "" : r.getTimeSlot()
            );

      } else {
        // 물품 대여
        text = "%s | 대여 %s | 반납 예정: %s"
            .formatted(
                r.getResourceName(),
                DATETIME.format(r.getStartDate()),
                DATETIME.format(r.getEndDate())
            );
      }

      model.addElement(text);
    }
  }


  // ===========================
  //  강의실 예약 상세
  // ===========================
  private void showFacilityDetail(MainFrame frame, ReservationEntity r) {

    String msg = """
                [강의실 예약 상세]
                신청자: %s
                시설: %s
                날짜: %s
                시간대: %s
                행사명: %s
                """
        .formatted(
            r.getUserName(),
            r.getResourceName(),
            DATE.format(r.getStartDate()),
            r.getTimeSlot(),
            r.getEventName()
        );

    JOptionPane.showMessageDialog(frame, msg);
  }


  // ===========================
  //  물품 대여 상세 + 반납
  // ===========================
  private void showItemDetail(MainFrame frame, ReservationEntity r) {

    int option = JOptionPane.showConfirmDialog(
        frame,
        """
        [물품 대여 상세]
        신청자: %s
        물품: %s
        대여 시작: %s
        반납 예정: %s
        
        지금 반납 처리하시겠습니까?
        """
            .formatted(
                r.getUserName(),
                r.getResourceName(),
                DATETIME.format(r.getStartDate()),
                DATETIME.format(r.getEndDate())
            ),
        "반납 확인",
        JOptionPane.YES_NO_OPTION
    );

    if (option == JOptionPane.YES_OPTION) {
      RepositoryManager repo = RepositoryManager.getInstance();
      r.setReturned(true);
      repo.reservations.update(r);

      JOptionPane.showMessageDialog(frame, "반납이 처리되었습니다.");
    }
  }

  private void cancelSelected(DefaultListModel<String> model, JList<String> list) {
    int idx = list.getSelectedIndex();
    if (idx < 0) {
      JOptionPane.showMessageDialog(null, "취소할 예약을 선택하세요.");
      return;
    }

    List<ReservationEntity> reservations = getUserReservations();
    if (idx >= reservations.size()) return;

    ReservationEntity r = reservations.get(idx);
    int opt = JOptionPane.showConfirmDialog(
        null,
        """
        선택한 예약을 취소하시겠습니까?
        자원: %s
        기간: %s ~ %s
        """.formatted(
            r.getResourceName(),
            r.getStartDate() == null ? "" : DATETIME.format(r.getStartDate()),
            r.getEndDate() == null ? "" : DATETIME.format(r.getEndDate())
        ),
        "예약 취소",
        JOptionPane.YES_NO_OPTION
    );
    if (opt != JOptionPane.YES_OPTION) return;

    r.setReturned(true);
    RepositoryManager repo = RepositoryManager.getInstance();
    repo.reservations.update(r);
    reload(model);
    JOptionPane.showMessageDialog(null, "예약이 취소되었습니다.");
  }
}
