package command;

import Repository.RepositoryManager;
import entity.ReservationEntity;

public class ReturnItemCommand implements Command {

    private final ReservationEntity reservation;

    public ReturnItemCommand(ReservationEntity reservation) {
        this.reservation = reservation;
    }

    @Override
    public boolean execute() {
        reservation.setReturned(true);
        RepositoryManager repo = RepositoryManager.getInstance();
        repo.reservations.update(reservation);
        return true;
    }
}
