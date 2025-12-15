package ui.Main.admin;

import Repository.RepositoryManager;
import entity.LectureEntity;
import entity.ResourceEntity;
import observer.EventType;
import observer.Observer;
import reservation.ReservationManager;
import resource.RentableResource;
import resource.ReservableResource;
import ui.Main.MainFrame;

import javax.swing.*;
import java.awt.*;
import java.util.ArrayList;
import java.util.List;

public class AdminEditPanel extends JPanel implements Observer {

  private final ReservationManager manager = ReservationManager.getInstance();
  private final DefaultListModel<String> model = new DefaultListModel<>();
  private final JList<String> list = new JList<>(model);

  // JList index ↔ 실제 자원(강의실/물품) 식별용
  private final List<ResourceKey> resourceKeys = new ArrayList<>();

  private static class ResourceKey {
    final String type;   // "LECTURE" or "ITEM"
    final String name;   // 자원 이름

    ResourceKey(String type, String name) {
      this.type = type;
      this.name = name;
    }
  }

  public AdminEditPanel(MainFrame frame, ReservationManager manager) {

    this.manager.addObserver(this);

    setLayout(new BorderLayout());

    JLabel title = new JLabel("[자원 속성 관리]", SwingConstants.CENTER);
    add(title, BorderLayout.NORTH);

    add(new JScrollPane(list), BorderLayout.CENTER);

    JPanel bottom = new JPanel(new GridLayout(6, 1, 10, 10));
    JTextField depositField = new JTextField();
    JTextField rentalDaysField = new JTextField();
    JButton saveBtn = new JButton("수정 저장");
    JButton backBtn = new JButton("뒤로");

    bottom.add(new JLabel("보증금:"));
    bottom.add(depositField);
    bottom.add(new JLabel("대여기간(물품만):"));
    bottom.add(rentalDaysField);
    bottom.add(saveBtn);
    bottom.add(backBtn);

    add(bottom, BorderLayout.SOUTH);

    // 화면 들어올 때마다 DB 기준으로 갱신
    addComponentListener(new java.awt.event.ComponentAdapter() {
      @Override
      public void componentShown(java.awt.event.ComponentEvent e) {
        reload();
      }
    });

    // 리스트 선택 시, 현재 값들을 입력창에 채워주기
    list.addListSelectionListener(e -> {
      if (e.getValueIsAdjusting()) return;
      int idx = list.getSelectedIndex();
      if (idx < 0 || idx >= resourceKeys.size()) return;

      RepositoryManager repo = RepositoryManager.getInstance();
      ResourceKey key = resourceKeys.get(idx);

      if ("LECTURE".equals(key.type)) {
        LectureEntity le = repo.lectures.findByName(key.name);
        if (le != null) {
          depositField.setText(String.valueOf(le.getDeposit()));
          rentalDaysField.setText("");  // 강의실은 기간 없음
        }
      } else {
        ResourceEntity re = repo.resources.findByName(key.name);
        if (re != null) {
          depositField.setText(String.valueOf(re.getDeposit()));
          rentalDaysField.setText(String.valueOf(re.getRentalPeriod()));
        }
      }
    });

    saveBtn.addActionListener(e -> {

      int idx = list.getSelectedIndex();
      if (idx < 0 || idx >= resourceKeys.size()) {
        JOptionPane.showMessageDialog(frame, "수정할 자원을 선택하세요.");
        return;
      }

      ResourceKey key = resourceKeys.get(idx);
      RepositoryManager repo = RepositoryManager.getInstance();

      try {
        int dep = Integer.parseInt(depositField.getText().trim());

        if ("LECTURE".equals(key.type)) {
          // === 강의실 ===
          LectureEntity le = repo.lectures.findByName(key.name);
          if (le != null) {
            le.setDeposit(dep);
            repo.lectures.update(le);
          }

          // 메모리상의 ReservableResource도 업데이트
          manager.getReservables().stream()
                  .filter(r -> r.getName().equals(key.name))
                  .findFirst()
                  .ifPresent(r -> r.setDeposit(dep));

        } else {
          // === 물품 ===
          int period = Integer.parseInt(rentalDaysField.getText().trim());

          ResourceEntity re = repo.resources.findByName(key.name);
          if (re != null) {
            re.setDeposit(dep);
            re.setRentalPeriod(period);
            repo.resources.update(re);
          }

          manager.getRentables().stream()
                  .filter(r -> r.getName().equals(key.name))
                  .findFirst()
                  .ifPresent(r -> {
                    r.setDeposit(dep);
                    r.setRentalPeriod(period);
                  });
        }

        JOptionPane.showMessageDialog(frame, "DB 저장 + 메모리 반영 완료!");
        reload();

      } catch (NumberFormatException ex) {
        JOptionPane.showMessageDialog(frame, "보증금/대여기간은 숫자로 입력하세요.");
      } catch (Exception ex) {
        JOptionPane.showMessageDialog(frame, "값을 다시 확인하세요.");
      }
    });

    backBtn.addActionListener(e -> frame.showPanel("ADMIN"));

    // 초기 로딩
    reload();
  }

  // Observer 이벤트 → DB 기준으로 새로 그리기
  @Override
  public void update(EventType eventType) {
    SwingUtilities.invokeLater(this::reload);
  }

  // DB에서 강의실/물품 읽어서 목록 갱신
  private void reload() {
    model.clear();
    resourceKeys.clear();

    RepositoryManager repo = RepositoryManager.getInstance();

    // === 강의실 ===
    for (LectureEntity le : repo.lectures.findAll()) {
      String text = "[강의실] %s | 보증금 %d".formatted(
              le.getName(),
              le.getDeposit()
      );
      model.addElement(text);
      resourceKeys.add(new ResourceKey("LECTURE", le.getName()));
    }

    // === 물품 ===
    for (ResourceEntity re : repo.resources.findAll()) {
      String text = "[물품] %s | 보증금 %d | 대여기간 %d일".formatted(
              re.getName(),
              re.getDeposit(),
              re.getRentalPeriod()
      );
      model.addElement(text);
      resourceKeys.add(new ResourceKey("ITEM", re.getName()));
    }

    list.revalidate();
    list.repaint();
  }
}
