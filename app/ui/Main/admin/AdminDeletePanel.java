package ui.Main.admin;

import Repository.RepositoryManager;
import entity.LectureEntity;
import entity.ResourceEntity;
import observer.EventType;
import observer.Observer;
import reservation.ReservationManager;
import resource.Resource;
import ui.Main.MainFrame;

import javax.swing.*;
import java.awt.*;
public class AdminDeletePanel extends JPanel implements Observer {

  private DefaultListModel<ResourceOption> model;   // 자원 모델
  private JList<ResourceOption> list;               // 자원 리스트 컴포넌트
  private final ReservationManager manager = ReservationManager.getInstance();

  public static record ResourceOption(String type, String name, String label) {
    @Override public String toString() { return label; }
  }

  public AdminDeletePanel(MainFrame frame, ReservationManager manager) {

    // 자원 Observer 등록
    manager.addObserver(this);

    setLayout(new BorderLayout(10,10));

    JLabel title = new JLabel("[자원 삭제/비활성화]", SwingConstants.CENTER);
    add(title, BorderLayout.NORTH);

    // 자원 모델을 기본 리스트 모델로 초기화
    model = new DefaultListModel<>();
    list = new JList<>(model);

    add(new JScrollPane(list), BorderLayout.CENTER);

    JButton disableBtn = new JButton("비활성화");
    JButton backBtn = new JButton("뒤로");

    JPanel bottom = new JPanel(new FlowLayout());
    bottom.add(disableBtn);
    bottom.add(backBtn);
    add(bottom, BorderLayout.SOUTH);

    // 화면 표시될 때마다 목록 갱신
    addComponentListener(new java.awt.event.ComponentAdapter() {
      public void componentShown(java.awt.event.ComponentEvent evt) {
        reload();
      }
    });

    // 자원 삭제 버튼
    disableBtn.addActionListener(e -> {

      ResourceOption selected = list.getSelectedValue();
      if (selected == null) return;

      RepositoryManager repo = RepositoryManager.getInstance();

      // DB 삭제
      if ("LECTURE".equals(selected.type())) {
        repo.lectures.deleteByName(selected.name());
      } else {
        repo.resources.deleteByName(selected.name());
      }

      // 예약 시스템에도 반영
      manager.removeResourceByName(selected.name());

      JOptionPane.showMessageDialog(frame, "비활성화(삭제) 완료!");

      reload();
    });

    backBtn.addActionListener(e -> frame.showPanel("ADMIN"));
  }

  // 자원 Observer 이벤트 발생 시 목록 갱신
  @Override
  public void update(EventType eventType) {
    if (eventType == EventType.RESOURCE_ADDED ||
            eventType == EventType.RESOURCE_REMOVED ||
            eventType == EventType.RESOURCE_UPDATED) {
      reload();
    }
  }

  // 자원 삭제 리스트 갱신 함수
  private void reload() {
    model.clear();
    RepositoryManager repo = RepositoryManager.getInstance();

    for (LectureEntity le : repo.lectures.findAll()) {
      String label = "강의실 - " + le.getName() + " (avail=" + le.isAvailable() + ")";
      model.addElement(new ResourceOption("LECTURE", le.getName(), label));
    }
    for (ResourceEntity re : repo.resources.findAll()) {
      String label = "물품 - " + re.getName();
      model.addElement(new ResourceOption("ITEM", re.getName(), label));
    }
  }
}