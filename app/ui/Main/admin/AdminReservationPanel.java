package ui.Main.admin;

import Repository.RepositoryManager;
import entity.ReservationEntity;
import observer.EventType;
import observer.Observer;
import reservation.ReservationManager;
import ui.Main.MainFrame;

import javax.swing.*;
import java.awt.*;
import java.text.SimpleDateFormat;
import java.util.List;

public class AdminReservationPanel extends JPanel implements Observer {

  private static final SimpleDateFormat DATE = new SimpleDateFormat("yyyy-MM-dd HH:mm");

  private final ReservationManager manager = ReservationManager.getInstance();
  private final RepositoryManager repo = RepositoryManager.getInstance();

  private DefaultListModel<ReservationEntity> model;
  private JList<ReservationEntity> list;

  public AdminReservationPanel(MainFrame frame) {

    // 🔥 Observer 등록 (두 군데 모두)
    manager.addObserver(this);        // 예약 시스템 이벤트 (기존)
    repo.addObserver(this);           // 🔥 DB 변경 이벤트 추가됨

    setLayout(new BorderLayout(10,10));
    setBorder(BorderFactory.createEmptyBorder(10,10,10,10));

    JLabel title = new JLabel("[예약 현황/취소]", SwingConstants.CENTER);
    add(title, BorderLayout.NORTH);

    model = new DefaultListModel<>();
    list = new JList<>(model);
    list.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);

    list.setCellRenderer((jList, value, index, isSelected, cellHasFocus) -> {
      String userDisplay = (value.getUserName() == null || value.getUserName().isEmpty())
              ? value.getUserId()
              : value.getUserName();

      String text = "%s | %s ~ %s | 사용자: %s (%s)"
              .formatted(
                      value.getResourceName(),
                      value.getStartDate() == null ? "" : DATE.format(value.getStartDate()),
                      value.getEndDate() == null ? "" : DATE.format(value.getEndDate()),
                      userDisplay,
                      value.getUserId()
              );

      JLabel label = new JLabel(text);
      if (isSelected) {
        label.setOpaque(true);
        label.setBackground(jList.getSelectionBackground());
        label.setForeground(jList.getSelectionForeground());
      }
      return label;
    });

    add(new JScrollPane(list), BorderLayout.CENTER);

    JButton refreshBtn = new JButton("새로고침");
    JButton cancelBtn = new JButton("선택 예약 취소");
    JButton backBtn = new JButton("뒤로");

    JPanel bottom = new JPanel(new FlowLayout());
    bottom.add(refreshBtn);
    bottom.add(cancelBtn);
    bottom.add(backBtn);

    add(bottom, BorderLayout.SOUTH);

    refreshBtn.addActionListener(e -> reload());
    addComponentListener(new java.awt.event.ComponentAdapter() {
      @Override
      public void componentShown(java.awt.event.ComponentEvent e) {
        reload();
      }
    });


    cancelBtn.addActionListener(e -> {
      ReservationEntity r = list.getSelectedValue();
      if (r == null) {
        JOptionPane.showMessageDialog(frame, "취소할 예약을 선택하세요.");
        return;
      }
      int opt = JOptionPane.showConfirmDialog(frame,
              "선택한 예약을 취소하시겠습니까?\n자원: %s\n시간: %s ~ %s"
                      .formatted(
                              r.getResourceName(),
                              r.getStartDate() == null ? "" : DATE.format(r.getStartDate()),
                              r.getEndDate() == null ? "" : DATE.format(r.getEndDate())
                      ),
              "예약 취소",
              JOptionPane.YES_NO_OPTION);

      if (opt != JOptionPane.YES_OPTION) return;

      r.setReturned(true);
      repo.reservations.update(r);
      reload();
      JOptionPane.showMessageDialog(frame, "예약이 취소되었습니다.");
    });

    backBtn.addActionListener(e -> frame.showPanel("ADMIN"));

    reload();
  }

  // 🔥 ReservationManager + RepositoryManager 이벤트 모두 수신
  @Override
  public void update(EventType eventType) {

    // 예약 관련 DB 이벤트 or 자원 삭제 이벤트도 반영
    if (eventType == EventType.RESERVATION_CREATED ||
            eventType == EventType.ITEM_RENTED ||
            eventType == EventType.ITEM_RETURNED ||
            eventType == EventType.RESOURCE_REMOVED ||
            eventType == EventType.RESOURCE_ADDED ||
            eventType == EventType.RESOURCE_UPDATED) {

      SwingUtilities.invokeLater(this::reload);
    }
  }

  private void reload() {
    model.clear();

    List<ReservationEntity> all = repo.reservations.findAll();
    for (ReservationEntity r : all) {
      if (!r.isReturned()) {
        model.addElement(r);
      }
    }

    list.revalidate();
    list.repaint();
  }
}
