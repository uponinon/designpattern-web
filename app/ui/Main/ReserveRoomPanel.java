package ui.Main;

import Repository.RepositoryManager;
import entity.LectureEntity;
import observer.EventType;
import observer.Observer;
import reservation.ReservationManager;

import javax.swing.*;
import java.awt.*;
import java.time.LocalDate;

public class ReserveRoomPanel extends JPanel implements Observer {

  public static String selectedRoomName;
  public static LocalDate selectedDate;

  private final DefaultListModel<String> model = new DefaultListModel<>();
  private final JList<String> list = new JList<>(model);
  private final ReservationManager manager = ReservationManager.getInstance();

  public ReserveRoomPanel(MainFrame frame, ReservationManager manager) {

    // 🔥 같은 싱글톤이겠지만 어쨌든 옵저버 등록
    manager.addObserver(this);

    setLayout(new BorderLayout());

    add(new JScrollPane(list), BorderLayout.CENTER);

    JTextField dateField = new JTextField(LocalDate.now().toString());
    JButton nextBtn = new JButton("7일 예약표 보기");
    JButton backBtn = new JButton("뒤로");

    JPanel south = new JPanel(new GridLayout(4,1));
    south.add(new JLabel("시작 날짜(yyyy-MM-dd):"));
    south.add(dateField);
    south.add(nextBtn);
    south.add(backBtn);

    add(south, BorderLayout.SOUTH);

    nextBtn.addActionListener(e -> {
      int idx = list.getSelectedIndex();
      if (idx < 0) {
        JOptionPane.showMessageDialog(frame, "강의실을 선택하세요.");
        return;
      }

      // "이름 (보증금 ...)" 형태에서 이름만 추출
      selectedRoomName = model.get(idx).split(" \\(")[0];
      selectedDate = LocalDate.parse(dateField.getText());
      frame.showPanel("ROOM_TIMELINE");
    });

    backBtn.addActionListener(e -> frame.showPanel("MENU"));

    // 🔥 화면에 보일 때마다 강제 새로고침
    addComponentListener(new java.awt.event.ComponentAdapter() {
      @Override
      public void componentShown(java.awt.event.ComponentEvent e) {
        refreshRooms();
      }
    });

    // 🔥 최초 한 번 로딩
    refreshRooms();
  }

  // 🔥 강의실 목록을 "DB 기준"으로 다시 읽어옴
  public void refreshRooms() {
    System.out.println("[ReserveRoomPanel] refreshRooms() 호출");

    model.clear();

    RepositoryManager repo = RepositoryManager.getInstance();

    for (LectureEntity le : repo.lectures.findAll()) {
      // 필요하면 le.isAvailable() 필터도 가능
      model.addElement(
              "%s (보증금 %d원)".formatted(
                      le.getName(),
                      le.getDeposit()
              )
      );
    }

    list.revalidate();
    list.repaint();
  }

  // 🔥 어떤 자원 관련 이벤트가 오든 걍 새로 땡겨서 그린다
  @Override
  public void update(EventType eventType) {
    SwingUtilities.invokeLater(this::refreshRooms);
  }
}
