package ui.Main;

import reservation.ReservationManager;

import javax.swing.*;
import java.awt.*;

public class MenuPanel extends JPanel {


  public MenuPanel(MainFrame frame, ReservationManager manager) {

    setLayout(new BorderLayout(10, 10));

    JPanel center = new JPanel(new GridLayout(6, 1, 10, 10));
    center.add(new JLabel("[메인 메뉴]", SwingConstants.CENTER));

    JButton b1 = new JButton("1. 시설 예약");
    JButton b2 = new JButton("2. 시설물 대여");
    JButton b3 = new JButton("3. 내 예약 현황 조회");
    JButton exit = new JButton("4. 종료");

    b1.addActionListener(e -> frame.show("RESERVE_ROOM"));
    b2.addActionListener(e -> frame.show("RENT_ITEM"));
    b3.addActionListener(e -> frame.show("MY_RES"));
    exit.addActionListener(e -> System.exit(0));

    center.add(b1);
    center.add(b2);
    center.add(b3);
    center.add(exit);

    add(center, BorderLayout.CENTER);

    // 로그인 이후 첫 화면에서만 작은 로그아웃 버튼 노출
    JButton logoutBtn = new JButton("로그아웃");
    logoutBtn.setFont(logoutBtn.getFont().deriveFont(10f));
    logoutBtn.addActionListener(e -> {
      LoginPanel.currentUserId = null;
      LoginPanel.currentUserName = null;
      frame.showPanel("LOGIN");
    });

    JPanel south = new JPanel(new FlowLayout(FlowLayout.RIGHT));
    south.add(logoutBtn);
    add(south, BorderLayout.SOUTH);
  }
}
