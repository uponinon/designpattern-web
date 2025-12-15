package ui.Main.admin;

import Repository.RepositoryManager;
import entity.LectureEntity;
import entity.ResourceEntity;
import manager.ResourceType;
import observer.EventType;
import observer.Observer;
import reservation.ReservationManager;
import resource.LectureRoomFeature;
import resource.LectureRoomSize;
import ui.Main.LoginPanel;
import ui.Main.MainFrame;

import javax.swing.*;
import java.awt.*;

public class AdminAddPanel extends JPanel implements Observer {

  private final JTextArea output = new JTextArea();
  private final ReservationManager manager = ReservationManager.getInstance();

  public AdminAddPanel(MainFrame frame) {

    // 🔥 Observer 등록
    manager.addObserver(this);

    setLayout(new BorderLayout(10, 10));
    setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

    JLabel title = new JLabel("자원 등록", SwingConstants.LEFT);
    title.setFont(title.getFont().deriveFont(Font.BOLD, 18f));
    add(title, BorderLayout.NORTH);

    JPanel formPanel = new JPanel(new GridBagLayout());
    GridBagConstraints c = new GridBagConstraints();
    c.insets = new Insets(6, 6, 6, 6);
    c.fill = GridBagConstraints.HORIZONTAL;
    c.anchor = GridBagConstraints.WEST;

    JComboBox<ResourceType> typeBox = new JComboBox<>(ResourceType.values());
    typeBox.setRenderer(new DefaultListCellRenderer() {
      @Override
      public Component getListCellRendererComponent(JList<?> list, Object value, int index, boolean isSelected, boolean cellHasFocus) {
        Object display = value instanceof ResourceType ? ((ResourceType) value).getDisplayName() : value;
        return super.getListCellRendererComponent(list, display, index, isSelected, cellHasFocus);
      }
    });
    JComboBox<LectureRoomSize> sizeBox = new JComboBox<>(LectureRoomSize.values());
    sizeBox.setRenderer(new DefaultListCellRenderer() {
      @Override
      public Component getListCellRendererComponent(JList<?> list, Object value, int index, boolean isSelected, boolean cellHasFocus) {
        Object display = value instanceof LectureRoomSize ? ((LectureRoomSize) value).getDisplayName() : value;
        return super.getListCellRendererComponent(list, display, index, isSelected, cellHasFocus);
      }
    });
    JComboBox<LectureRoomFeature> featureBox = new JComboBox<>(LectureRoomFeature.values());
    featureBox.setRenderer(new DefaultListCellRenderer() {
      @Override
      public Component getListCellRendererComponent(JList<?> list, Object value, int index, boolean isSelected, boolean cellHasFocus) {
        Object display = value instanceof LectureRoomFeature ? ((LectureRoomFeature) value).getDisplayName() : value;
        return super.getListCellRendererComponent(list, display, index, isSelected, cellHasFocus);
      }
    });
    JTextField nameField = new JTextField();
    JTextField depositField = new JTextField();
    JButton addBtn = new JButton("자원 등록");
    JButton backBtn = new JButton("뒤로");
    JButton listBtn = new JButton("자원 목록 새로고침");

    c.gridx = 0; c.gridy = 0;
    formPanel.add(new JLabel("구분"), c);
    c.gridx = 1; c.weightx = 1.0;
    formPanel.add(typeBox, c);

    c.gridx = 0; c.gridy = 1; c.weightx = 0;
    formPanel.add(new JLabel("강의실 크기:"), c);
    c.gridx = 1; c.weightx = 1.0;
    formPanel.add(sizeBox, c);

    c.gridx = 0; c.gridy = 2; c.weightx = 0;
    formPanel.add(new JLabel("특수 옵션:"), c);
    c.gridx = 1; c.weightx = 1.0;
    formPanel.add(featureBox, c);

    c.gridx = 0; c.gridy = 3; c.weightx = 0;
    formPanel.add(new JLabel("이름:"), c);
    c.gridx = 1; c.weightx = 1.0;
    formPanel.add(nameField, c);

    c.gridx = 0; c.gridy = 4; c.weightx = 0;
    formPanel.add(new JLabel("보증금"), c);
    c.gridx = 1; c.weightx = 1.0;
    formPanel.add(depositField, c);

    c.gridx = 0; c.gridy = 5; c.weightx = 0;
    formPanel.add(backBtn, c);
    c.gridx = 1; c.weightx = 1.0;
    formPanel.add(addBtn, c);

    JPanel topWrapper = new JPanel(new BorderLayout(10, 10));
    topWrapper.add(formPanel, BorderLayout.CENTER);
    topWrapper.add(listBtn, BorderLayout.SOUTH);

    add(topWrapper, BorderLayout.NORTH);

    output.setEditable(false);
    output.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 12));
    JScrollPane scroll = new JScrollPane(output);
    add(scroll, BorderLayout.CENTER);

    // 강의실 전용 옵션
    typeBox.addActionListener(e -> {
      boolean lecture = typeBox.getSelectedItem() == ResourceType.LECTURE;
      sizeBox.setEnabled(lecture);
      featureBox.setEnabled(lecture);
    });
    sizeBox.setEnabled(true);
    featureBox.setEnabled(true);
    // 🔥 여기에 넣어야 함 — 반드시 생성자 내부에서
    addComponentListener(new java.awt.event.ComponentAdapter() {
      @Override
      public void componentShown(java.awt.event.ComponentEvent e) {
        System.out.println("[AdminAddPanel] 화면 표시됨 → refreshList()");
        refreshList();
      }
    });


    addBtn.addActionListener(e -> {

      ResourceType type = (ResourceType) typeBox.getSelectedItem();
      String name = nameField.getText().trim();
      String dep = depositField.getText().trim();

      if (name.isEmpty() || dep.isEmpty()) {
        JOptionPane.showMessageDialog(frame, "값을 모두 입력하세요");
        return;
      }

      int deposit;
      try {
        deposit = Integer.parseInt(dep);
      } catch (Exception ex) {
        JOptionPane.showMessageDialog(frame, "보증금은 숫자로 입력하세요");
        return;
      }

      if (LoginPanel.currentAdmin == null) {
        JOptionPane.showMessageDialog(frame, "관리자 로그인 후 이용해주세요");
        return;
      }

      LectureRoomSize size = (LectureRoomSize) sizeBox.getSelectedItem();
      LectureRoomFeature feature = (LectureRoomFeature) featureBox.getSelectedItem();

      boolean ok = (type == ResourceType.LECTURE)
              ? LoginPanel.currentAdmin.registerResource(manager, type, name, deposit, size, feature)
              : LoginPanel.currentAdmin.registerResource(manager, type, name, deposit);

      if (!ok) {
        JOptionPane.showMessageDialog(frame, "이미 존재하는 자원입니다.");
      } else {
        JOptionPane.showMessageDialog(frame, "등록 성공!");
        nameField.setText("");
        depositField.setText("");
        refreshList();   // 버튼 눌렀을 때도 갱신
      }
    });

    listBtn.addActionListener(e -> refreshList());
    backBtn.addActionListener(e -> frame.showPanel("ADMIN"));

    // 초기 로딩
    refreshList();
  }

  // 🔥 Observer 수신 처리 (이벤트 종류는 그냥 무시하고 무조건 갱신)
  @Override
  public void update(EventType type) {
    SwingUtilities.invokeLater(this::refreshList);
  }
  // 🔥 DB 기준으로 자원 목록 다시 그리기
  private void refreshList() {
    System.out.println("[AdminAddPanel] refreshList 호출"); // 디버깅용 로그

    RepositoryManager repo = RepositoryManager.getInstance();

    StringBuilder sb = new StringBuilder();
    sb.append("== 강의실 자원 (DB 기준) ==\n");
    for (LectureEntity le : repo.lectures.findAll()) {
      sb.append("- %s (deposit=%d, available=%s)\n"
              .formatted(le.getName(), le.getDeposit(), le.isAvailable()));
    }

    sb.append("\n== 물품 자원 (DB 기준) ==\n");
    for (ResourceEntity re : repo.resources.findAll()) {
      sb.append("- %s (deposit=%d, period=%d)\n"
              .formatted(re.getName(), re.getDeposit(), re.getRentalPeriod()));
    }

    output.setText(sb.toString());

    // 🔥 화면 갱신 필수
    output.revalidate();
    output.repaint();
  }


}
