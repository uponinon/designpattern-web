package ui.Main;

import Repository.RepositoryManager;
import entity.AdminEntity;
import entity.UserEntity;
import reservation.ReservationManager;

import javax.swing.*;
import java.awt.*;

public class LoginPanel extends JPanel {

  public static String currentUserId;
  public static String currentUserName;
  public static user.Admin currentAdmin;

  public LoginPanel(MainFrame frame, ReservationManager manager) {

    setLayout(new GridBagLayout());
    setBorder(BorderFactory.createEmptyBorder(40, 40, 40, 40));

    GridBagConstraints c = new GridBagConstraints();
    c.insets = new Insets(10, 10, 10, 10);
    c.fill = GridBagConstraints.HORIZONTAL;

    JLabel title = new JLabel("학교 시설/시설물 대여 시스템");
    title.setFont(new Font("Dialog", Font.BOLD, 22));
    title.setHorizontalAlignment(SwingConstants.CENTER);

    JTextField idField = new JTextField(15);
    JTextField nameField = new JTextField(15);

    JButton loginBtn = new JButton("로그인");
    loginBtn.setFont(new Font("Dialog", Font.BOLD, 16));

    c.gridx = 0; c.gridy = 0; c.gridwidth = 2;
    add(title, c);

    c.gridy = 1; c.gridwidth = 1;
    add(new JLabel("학번:"), c);

    c.gridx = 1;
    add(idField, c);

    c.gridx = 0; c.gridy = 2;
    add(new JLabel("이름:"), c);

    c.gridx = 1;
    add(nameField, c);

    c.gridx = 0; c.gridy = 3; c.gridwidth = 2;
    add(loginBtn, c);

    // ===========================
    // 로그인 버튼(DB 연동 버전)
    // ===========================
    loginBtn.addActionListener(e -> {

      String id = idField.getText().trim();
      String name = nameField.getText().trim();

      if (id.isEmpty() || name.isEmpty()) {
        JOptionPane.showMessageDialog(frame, "학번/이름을 모두 입력하세요");
        return;
      }

      RepositoryManager repo = RepositoryManager.getInstance();

      // ① 관리자 DB 체크
      if (id.equals("99999999")) {
        currentAdmin = new user.Admin(id, name, id);  // 이름 무시하고 관리자
        currentUserId = id;
        currentUserName = name;

        System.out.println("[LOGIN] 관리자 강제 로그인(99999999)");
        frame.showPanel("ADMIN");
        return;
      }
      // 추가 관리자 계정(9999/9999)
      if (id.equals("9999")) {
        AdminEntity admin9999 = repo.admins.findByField("studentId", "9999");
        if (admin9999 == null) {
          admin9999 = new AdminEntity("9999", "관리자", "9999");
          repo.admins.save(admin9999);
        }
        currentAdmin = new user.Admin(admin9999.getStudentId(), admin9999.getName(), admin9999.getAdminId());
        currentUserId = admin9999.getStudentId();
        currentUserName = admin9999.getName();

        System.out.println("[LOGIN] 관리자 강제 로그인(9999)");
        frame.showPanel("ADMIN");
        return;
      }
      AdminEntity admin = repo.admins.findByField("studentId", id);
      if (admin != null) {
        // DB에 존재하는 관리자
        currentAdmin = new user.Admin(admin.getStudentId(), admin.getName(), admin.getAdminId());
        currentUserId = admin.getStudentId();
        currentUserName = admin.getName();

        System.out.println("[LOGIN] 관리자 DB 로그인");
        frame.showPanel("ADMIN");
        return;
      }

      // ② 사용자 DB 체크
      UserEntity user = repo.users.findByField("studentId", id);

      if (user == null) {
        // ③ 일반 사용자 자동 생성
        user = new UserEntity(id, name);
        repo.users.save(user);

        System.out.println("[DB] 신규 사용자 생성: " + id);
      }

      // 메모리 로그인 정보 업데이트
      currentUserId = id;
      currentUserName = name;

      frame.showPanel("MENU");
    });
  }
}
