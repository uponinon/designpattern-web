package command;

import Repository.RepositoryManager;
import entity.ReservationEntity;

public class CancelReservationCommand implements Command {

    private final ReservationEntity reservation;

    public CancelReservationCommand(ReservationEntity reservation) {
        this.reservation = reservation;
    }

    @Override
    public boolean execute() {
        RepositoryManager repo = RepositoryManager.getInstance();

        reservation.setReturned(true);
        repo.reservations.update(reservation);

        return true;
    }
}
