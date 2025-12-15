package command;

import Repository.RepositoryManager;
import entity.ReservationEntity;

import javax.swing.*;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

public class LoadRoomTimelineCommand implements Command {

    private final JTable table;
    private final String roomName;
    private final LocalDate startDate;
    private final String[] timeSlots;

    public LoadRoomTimelineCommand(JTable table,
                                   String roomName,
                                   LocalDate startDate,
                                   String[] timeSlots) {
        this.table = table;
        this.roomName = roomName;
        this.startDate = startDate;
        this.timeSlots = timeSlots;
    }

    private boolean sameDate(Date a, Date b) {
        return a.toInstant().atZone(ZoneId.systemDefault()).toLocalDate()
                .equals(b.toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
    }

    @Override
    public boolean execute() {

        if (roomName == null) {
            return false;
        }

        RepositoryManager repo = RepositoryManager.getInstance();
        List<ReservationEntity> reservations = repo.reservations.findAll();

        for (int row = 0; row < 3; row++) {
            for (int col = 0; col < 7; col++) {

                LocalDate ld = startDate.plusDays(row * 7L + col);
                Date date = Date.from(ld.atStartOfDay(ZoneId.systemDefault()).toInstant());

                List<ReservationEntity> sameDay = reservations.stream()
                        .filter(r -> !r.isReturned())
                        .filter(r -> "LECTURE".equals(r.getResourceType()))
                        .filter(r -> roomName.equals(r.getResourceName()))
                        .filter(r -> r.getStartDate() != null && sameDate(r.getStartDate(), date))
                        .toList();

                String result = sameDay.stream()
                        .map(r -> r.getTimeSlot() == null ? "" : r.getTimeSlot())
                        .filter(s -> !s.isEmpty())
                        .reduce((a, b) -> a + ", " + b)
                        .orElse("");

                table.setValueAt(result.isEmpty() ? "" : result, row, col);
            }
        }

        table.getTableHeader().repaint();
        return true;
    }
}
