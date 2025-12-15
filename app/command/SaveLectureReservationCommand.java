package command;

import Repository.RepositoryManager;
import entity.ReservationEntity;

public class SaveLectureReservationCommand implements Command {

    private final ReservationEntity reservation;

    public SaveLectureReservationCommand(ReservationEntity reservation) {
        this.reservation = reservation;
    }

    @Override
    public boolean execute() {
        RepositoryManager repo = RepositoryManager.getInstance();
        repo.reservations.save(reservation);
        return true;
    }
}
