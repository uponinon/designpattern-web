package main;

import reservation.ReservationManager;
import ui.Main.MainFrame;

import javax.swing.*;

public class SwingMain {
  public static void main(String[] args) {
    // MongoDB 드라이버 INFO 로그 방지 (SimpleLogger 사용 시)
    System.setProperty("org.slf4j.simpleLogger.defaultLogLevel", "error");
    System.setProperty("org.slf4j.simpleLogger.log.org.mongodb.driver", "error");

    ReservationManager manager = ReservationManager.getInstance();
    manager.loadResourcesFromDB();
    SwingUtilities.invokeLater(() -> new MainFrame(manager).setVisible(true));
  }
}
