package ui.Main.admin;

import Repository.RepositoryManager;
import entity.LectureEntity;
import entity.ResourceEntity;
import observer.EventType;
import observer.Observer;
import reservation.ReservationManager;
import ui.Main.MainFrame;

import javax.swing.*;
import java.awt.*;

public class AdminListPanel extends JPanel implements Observer {

  private final ReservationManager manager = ReservationManager.getInstance();
  private JTextArea area;

  public AdminListPanel(MainFrame frame, ReservationManager manager) {

    manager.addObserver(this);  // 🔥 Observer 등록

    setLayout(new BorderLayout(10,10));
    setBorder(BorderFactory.createEmptyBorder(20,20,20,20));

    JLabel title = new JLabel("[자원 목록 보기]", SwingConstants.CENTER);
    add(title, BorderLayout.NORTH);

    area = new JTextArea();
    area.setEditable(false);
    JScrollPane scroll = new JScrollPane(area);
    add(scroll, BorderLayout.CENTER);

    JButton back = new JButton("뒤로");
    add(back, BorderLayout.SOUTH);

    // 🔥 화면 보일 때마다 자동 목록 갱신
    addComponentListener(new java.awt.event.ComponentAdapter() {
      @Override
      public void componentShown(java.awt.event.ComponentEvent evt) {
        reloadText();
      }
    });

    back.addActionListener(e -> frame.showPanel("ADMIN"));

    // 🔥 초기 로딩
    reloadText();
  }

  // 🔥 Observer 이벤트 발생 → UI 갱신
  @Override
  public void update(EventType eventType) {
    SwingUtilities.invokeLater(this::reloadText);
  }

  // 🔥 DB 기준 목록 새로 출력
  private void reloadText() {
    RepositoryManager repo = RepositoryManager.getInstance();
    StringBuilder sb = new StringBuilder();

    sb.append("=== 강의실 목록 ===\n");
    for (LectureEntity le : repo.lectures.findAll()) {
      sb.append("- ")
              .append(le.getName())
              .append(" / deposit=")
              .append(le.getDeposit())
              .append(" / available=")
              .append(le.isAvailable())
              .append("\n");
    }

    sb.append("\n=== 대여 품목 목록 ===\n");
    for (ResourceEntity re : repo.resources.findAll()) {
      sb.append("- ")
              .append(re.getName())
              .append(" / deposit=")
              .append(re.getDeposit())
              .append("\n");
    }

    area.setText(sb.toString());
    area.revalidate();
    area.repaint();
  }
}
