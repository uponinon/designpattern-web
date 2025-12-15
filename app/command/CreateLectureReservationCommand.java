package command;

import Repository.RepositoryManager;
import entity.ReservationEntity;

import java.util.Date;

public class CreateLectureReservationCommand implements Command {

    private final String userId;
    private final String userName;
    private final String roomName;
    private final Date date;
    private final String timeSlot;
    private final String eventName;

    public CreateLectureReservationCommand(
            String userId,
            String userName,
            String roomName,
            Date date,
            String timeSlot,
            String eventName
    ) {
        this.userId = userId;
        this.userName = userName;
        this.roomName = roomName;
        this.date = date;
        this.timeSlot = timeSlot;
        this.eventName = eventName;
    }

    @Override
    public boolean execute() {

        ReservationEntity r = new ReservationEntity(
                userId,
                userName,
                roomName,
                "LECTURE",
                date,
                date,     // 동일 날짜
                timeSlot,
                eventName
        );

        RepositoryManager repo = RepositoryManager.getInstance();
        repo.reservations.save(r);

        return true;
    }
}
