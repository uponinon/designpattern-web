package command;

import Repository.RepositoryManager;
import entity.ReservationEntity;

import java.util.List;

public class LoadReservationsCommand implements Command {

    private final List<ReservationEntity> out;

    public LoadReservationsCommand(List<ReservationEntity> out) {
        this.out = out;
    }

    @Override
    public boolean execute() {
        out.clear();
        RepositoryManager repo = RepositoryManager.getInstance();

        for (ReservationEntity r : repo.reservations.findAll()) {
            if (!r.isReturned()) out.add(r);
        }
        return true;
    }
}
