package ui.Main.admin;

import observer.EventType;
import observer.Observer;
import resource.Resource;
import ui.Main.MainFrame;
import reservation.ReservationManager;

import javax.swing.*;
import java.awt.*;

public class AdminPanelMain extends JPanel{
  private DefaultListModel<String> model;
  private final ReservationManager manager = ReservationManager.getInstance();

  public AdminPanelMain(MainFrame frame, ReservationManager manager) {
    // 🔥 Observer 등록
    setLayout(new BorderLayout(10, 10));

    JPanel center = new JPanel(new GridLayout(3, 2, 8, 8));
    center.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

    JLabel title = new JLabel("=== 관리자 메뉴 ===", SwingConstants.CENTER);
    add(title, BorderLayout.NORTH);

    JButton b1 = new JButton("1. 자원 등록");
    JButton b2 = new JButton("2. 자원 삭제 (비활성화)");
    JButton b3 = new JButton("3. 자원 현황 조회");
    JButton b4 = new JButton("4. 예약 현황/취소");
    JButton b5 = new JButton("5. 자원 속성 관리");
    JButton b6 = new JButton("6. 메인 화면으로");

    b1.addActionListener(e -> frame.showPanel("ADMIN_ADD"));
    b2.addActionListener(e -> frame.showPanel("ADMIN_DELETE"));
    b3.addActionListener(e -> frame.showPanel("ADMIN_LIST"));
    b4.addActionListener(e -> frame.showPanel("ADMIN_RESERVATIONS"));
    b5.addActionListener(e -> frame.showPanel("ADMIN_EDIT"));
    b6.addActionListener(e -> frame.showPanel("LOGIN"));

    Dimension btnSize = new Dimension(240, 80);
    JButton[] btns = {b1, b2, b3, b4, b5, b6};
    for (JButton b : btns) {
      b.setPreferredSize(btnSize);
      center.add(b);
    }

    add(center, BorderLayout.CENTER);
  }
}
