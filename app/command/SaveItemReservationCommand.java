package command;

import Repository.RepositoryManager;
import entity.ReservationEntity;

public class SaveItemReservationCommand implements Command {

    private final ReservationEntity reservation;

    public SaveItemReservationCommand(ReservationEntity reservation) {
        this.reservation = reservation;
    }

    @Override
    public boolean execute() {
        RepositoryManager repo = RepositoryManager.getInstance();
        repo.reservations.save(reservation);
        return true;
    }
}
