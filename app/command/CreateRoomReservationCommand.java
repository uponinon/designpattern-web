package command;

import Repository.RepositoryManager;
import entity.ReservationEntity;

import javax.swing.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Date;

public class CreateRoomReservationCommand implements Command {

    private final String userId;
    private final String userName;
    private final String roomName;
    private final LocalDate date;
    private final String startStr;
    private final String endStr;

    public CreateRoomReservationCommand(String userId, String userName,
                                        String roomName,
                                        LocalDate date,
                                        String startStr,
                                        String endStr) {
        this.userId = userId;
        this.userName = userName;
        this.roomName = roomName;
        this.date = date;
        this.startStr = startStr;
        this.endStr = endStr;
    }

    private boolean overlapCheck(Date start, Date end) {
        return RepositoryManager.getInstance().reservations.findAll().stream()
                .filter(r -> !r.isReturned())
                .filter(r -> "LECTURE".equals(r.getResourceType()))
                .filter(r -> roomName.equals(r.getResourceName()))
                .filter(r -> r.getStartDate() != null && r.getEndDate() != null)
                .anyMatch(r ->
                        r.getStartDate().before(end) &&
                                r.getEndDate().after(start)
                );
    }

    @Override
    public boolean execute() {

        if (roomName == null) return false;

        LocalTime st = LocalTime.parse(startStr);
        LocalTime en = LocalTime.parse(endStr);

        if (!en.isAfter(st)) {
            JOptionPane.showMessageDialog(null, "종료 시간이 시작 시간보다 늦어야 합니다.");
            return false;
        }

        Date startDate = Date.from(date.atTime(st).atZone(ZoneId.systemDefault()).toInstant());
        Date endDate = Date.from(date.atTime(en).atZone(ZoneId.systemDefault()).toInstant());

        if (overlapCheck(startDate, endDate)) {
            JOptionPane.showMessageDialog(null, "해당 시간에는 이미 예약이 있습니다.");
            return false;
        }

        String slotText = startStr + " ~ " + endStr;

        ReservationEntity entity = new ReservationEntity(
                userId,
                userName,
                roomName,
                "LECTURE",
                startDate,
                endDate,
                slotText,
                null
        );

        RepositoryManager.getInstance().reservations.save(entity);
        return true;
    }
}
