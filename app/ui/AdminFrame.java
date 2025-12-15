package ui;

import manager.ResourceType;
import resource.LectureRoomFeature;
import resource.LectureRoomSize;
import reservation.ReservationManager;
import user.Admin;

import javax.swing.*;
import java.awt.*;

public class AdminFrame extends JFrame {
  private final ReservationManager manager;
  private final Admin admin;
  private final JTextArea output = new JTextArea(12, 40);

  public AdminFrame(ReservationManager manager, Admin admin) {
    this.manager = manager;
    this.admin = admin;

    setTitle("\uad00\ub9ac\uc790 \ubaa8\ub4dc");
    setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    setSize(560, 420);
    setLocationRelativeTo(null);

    var typeBox = new JComboBox<>(ResourceType.values());
    typeBox.setRenderer(new DefaultListCellRenderer() {
      @Override
      public Component getListCellRendererComponent(JList<?> list, Object value, int index, boolean isSelected, boolean cellHasFocus) {
        Object display = value instanceof ResourceType ? ((ResourceType) value).getDisplayName() : value;
        return super.getListCellRendererComponent(list, display, index, isSelected, cellHasFocus);
      }
    });
    var sizeBox = new JComboBox<>(LectureRoomSize.values());
    var featureBox = new JComboBox<>(LectureRoomFeature.values());
    sizeBox.setRenderer(new DefaultListCellRenderer() {
      @Override
      public Component getListCellRendererComponent(JList<?> list, Object value, int index, boolean isSelected, boolean cellHasFocus) {
        Object display = value instanceof LectureRoomSize ? ((LectureRoomSize) value).getDisplayName() : value;
        return super.getListCellRendererComponent(list, display, index, isSelected, cellHasFocus);
      }
    });
    featureBox.setRenderer(new DefaultListCellRenderer() {
      @Override
      public Component getListCellRendererComponent(JList<?> list, Object value, int index, boolean isSelected, boolean cellHasFocus) {
        Object display = value instanceof LectureRoomFeature ? ((LectureRoomFeature) value).getDisplayName() : value;
        return super.getListCellRendererComponent(list, display, index, isSelected, cellHasFocus);
      }
    });
    var nameField = new JTextField();
    var depositField = new JTextField();
    var addBtn = new JButton("\uc790\uc6d0 \ub4f1\ub85d");
    var listBtn = new JButton("\uc790\uc6d0 \ubaa9\ub85d \ubcf4\uae30");

    var form = new JPanel(new GridLayout(6, 2, 8, 8));
    form.setBorder(BorderFactory.createTitledBorder("\uc790\uc6d0 \ub4f1\ub85d"));
    form.add(new JLabel("\uad6c\ubd84"));
    form.add(typeBox);
    form.add(new JLabel("\uac15\uc758\uc2e4 \ud06c\uae30"));
    form.add(sizeBox);
    form.add(new JLabel("\ud2b9\uc218 \uc635\uc158"));
    form.add(featureBox);
    form.add(new JLabel("\uc774\ub984:"));
    form.add(nameField);
    form.add(new JLabel("\ubcf4\uc99d\uae08"));
    form.add(depositField);
    form.add(new JLabel());
    form.add(addBtn);

    output.setEditable(false);
    var scroll = new JScrollPane(output);

    var top = new JPanel(new BorderLayout(8, 8));
    top.add(form, BorderLayout.CENTER);
    top.add(listBtn, BorderLayout.SOUTH);

    var root = new JPanel(new BorderLayout(8, 8));
    root.setBorder(BorderFactory.createEmptyBorder(12, 12, 12, 12));
    root.add(top, BorderLayout.NORTH);
    root.add(scroll, BorderLayout.CENTER);
    setContentPane(root);

    // Toggle lecture-only options
    typeBox.addActionListener(e -> {
      boolean lecture = typeBox.getSelectedItem() == ResourceType.LECTURE;
      sizeBox.setEnabled(lecture);
      featureBox.setEnabled(lecture);
    });
    sizeBox.setEnabled(true);
    featureBox.setEnabled(true);

    addBtn.addActionListener(e -> {
      ResourceType type = (ResourceType) typeBox.getSelectedItem();
      String name = nameField.getText().trim();
      String dep = depositField.getText().trim();

      if (name.isEmpty() || dep.isEmpty()) {
        JOptionPane.showMessageDialog(this, "\uc774\ub984/\ubcf4\uc99d\uae08\uc744 \uc785\ub825\ud558\uc138\uc694");
        return;
      }

      int deposit;
      try {
        deposit = Integer.parseInt(dep);
      } catch (NumberFormatException ex) {
        JOptionPane.showMessageDialog(this, "\ubcf4\uc99d\uae08\uc740 \uc22b\uc790\ub85c \uc785\ub825\ud558\uc138\uc694");
        return;
      }

      boolean ok = (type == ResourceType.LECTURE)
          ? admin.registerResource(manager, type, name, deposit,
              (LectureRoomSize) sizeBox.getSelectedItem(),
              (LectureRoomFeature) featureBox.getSelectedItem())
          : admin.registerResource(manager, type, name, deposit);

      if (!ok) {
        JOptionPane.showMessageDialog(this, "\uc774\ubbf8 \uc874\uc7ac\ud558\ub294 \uc774\ub984\uc785\ub2c8\ub2e4", "\ub4f1\ub85d \uc2e4\ud328", JOptionPane.ERROR_MESSAGE);
      } else {
        JOptionPane.showMessageDialog(this, "\ub4f1\ub85d \uc131\uacf5!");
        output.append("[\ub4f1\ub85d] %s, %s, %d\n".formatted(type, name, deposit));
        nameField.setText("");
        depositField.setText("");
      }
    });

    listBtn.addActionListener(e -> {
      var sb = new StringBuilder();
      sb.append("== \uac15\uc758\uc2e4 \uc790\uc6d0 ==\n");
      manager.getReservables().forEach(r ->
          sb.append("- %s (deposit=%d, avail=%s)\n".formatted(r.getName(), r.getDeposit(), r.isAvailable())));

      sb.append("\n== \ubb3c\ud488 \uc790\uc6d0 ==\n");
      manager.getRentables().forEach(r ->
          sb.append("- %s (deposit=%d, avail=%s)\n".formatted(r.getName(), r.getDeposit(), r.isAvailable())));

      output.setText(sb.toString());
    });
  }
}
