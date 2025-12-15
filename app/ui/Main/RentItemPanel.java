package ui.Main;

import Repository.RepositoryManager;
import entity.ReservationEntity;
import entity.ResourceEntity;
import observer.EventType;
import observer.Observer;
import reservation.ReservationManager;

import javax.swing.*;
import java.awt.*;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

public class RentItemPanel extends JPanel implements Observer {

  private static final SimpleDateFormat DATE = new SimpleDateFormat("yyyy-MM-dd");
  private static final SimpleDateFormat DATETIME = new SimpleDateFormat("yyyy-MM-dd HH:mm");
  private static final int OPEN_HOUR = 9;
  private static final int CLOSE_HOUR = 20;

  private final ReservationManager manager = ReservationManager.getInstance();
  private final DefaultListModel<String> model = new DefaultListModel<>();
  private final JList<String> list = new JList<>(model);

  public RentItemPanel(MainFrame frame, ReservationManager manager) {

    manager.addObserver(this);   // 🔥 옵저버 등록
    setLayout(new BorderLayout());

    add(new JScrollPane(list), BorderLayout.CENTER);

    JPanel bottom = new JPanel(new GridLayout(6,1,10,10));
    bottom.setBorder(BorderFactory.createEmptyBorder(10,10,10,10));

    JTextField dateField = new JTextField(DATE.format(new Date()));
    JTextField timeField = new JTextField("14:00");
    JTextField endTimeField = new JTextField("16:00");

    JButton rentBtn = new JButton("대여하기");
    JButton backBtn = new JButton("뒤로");

    bottom.add(new JLabel("대여 시작 날짜 (yyyy-MM-dd):"));
    bottom.add(dateField);

    bottom.add(new JLabel("대여 시작 시각 (HH:mm):"));
    bottom.add(timeField);

    bottom.add(new JLabel("반납 예정 시각 (HH:mm, 마감 20:00):"));
    bottom.add(endTimeField);

    bottom.add(rentBtn);
    bottom.add(backBtn);

    add(bottom, BorderLayout.SOUTH);

    // ============================
    // 🔥 화면 표시될 때 자동 갱신
    // ============================
    addComponentListener(new java.awt.event.ComponentAdapter() {
      @Override
      public void componentShown(java.awt.event.ComponentEvent e) {
        refreshList();
      }
    });

    // 대여 버튼
    rentBtn.addActionListener(e -> {
      int idx = list.getSelectedIndex();
      if (idx < 0) {
        JOptionPane.showMessageDialog(frame, "물품을 선택하세요");
        return;
      }

      RepositoryManager repo = RepositoryManager.getInstance();
      List<ResourceEntity> items = repo.resources.findAll();
      ResourceEntity item = items.get(idx);

      Date start;
      try {
        start = DATETIME.parse(dateField.getText().trim() + " " + timeField.getText().trim());
      } catch (Exception ex) {
        JOptionPane.showMessageDialog(frame, "시작 날짜/시간 형식이 올바르지 않습니다.");
        return;
      }

      Calendar sc = Calendar.getInstance();
      sc.setTime(start);
      if (sc.get(Calendar.HOUR_OF_DAY) < OPEN_HOUR) {
        JOptionPane.showMessageDialog(frame, "대여 시작은 09:00 이후만 가능합니다.");
        return;
      }

      Date end;
      try {
        end = DATETIME.parse(dateField.getText().trim() + " " + endTimeField.getText().trim());
      } catch (Exception ex) {
        JOptionPane.showMessageDialog(frame, "반납 시간 형식이 올바르지 않습니다.");
        return;
      }

      Calendar ec = Calendar.getInstance();
      ec.setTime(end);
      if (ec.get(Calendar.HOUR_OF_DAY) > CLOSE_HOUR) {
        JOptionPane.showMessageDialog(frame, "반납은 20:00까지 가능합니다.");
        return;
      }

      if (!end.after(start)) {
        JOptionPane.showMessageDialog(frame, "반납 시간은 시작 시간보다 늦어야 합니다.");
        return;
      }

      ReservationEntity r = new ReservationEntity(
              LoginPanel.currentUserId,
              LoginPanel.currentUserName,
              item.getName(),
              "ITEM",
              start,
              end,
              null,
              null
      );

      repo.reservations.save(r);

      JOptionPane.showMessageDialog(frame,
              """
              [대여 완료]
              물품: %s
              대여 시작: %s
              반납 예정: %s
              보증금 %d원
              """.formatted(
                      item.getName(),
                      DATETIME.format(start),
                      DATETIME.format(end),
                      item.getDeposit()
              )
      );

      frame.showPanel("MENU");
    });

    backBtn.addActionListener(e -> frame.showPanel("MENU"));

    // 🔥 초기 로딩
    refreshList();
  }

  // 🔥 DB 기반 최신 물품 목록 로딩
  private void refreshList() {
    System.out.println("[RentItemPanel] refreshList() 호출됨");

    model.clear();
    RepositoryManager repo = RepositoryManager.getInstance();
    List<ResourceEntity> items = repo.resources.findAll();

    for (ResourceEntity r : items) {
      model.addElement(
              "%s (대여기간 %d일 / 보증금 %d원)"
                      .formatted(r.getName(), r.getRentalPeriod(), r.getDeposit())
      );
    }

    list.revalidate();
    list.repaint();
  }

  // 🔥 Observer 이벤트 → 자동 새로고침
  @Override
  public void update(EventType type) {
    SwingUtilities.invokeLater(this::refreshList);
  }
}
