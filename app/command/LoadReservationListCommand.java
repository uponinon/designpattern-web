package command;

import Repository.RepositoryManager;
import entity.ReservationEntity;

import javax.swing.*;
import java.util.List;

public class LoadReservationListCommand implements Command {

    private final DefaultListModel<ReservationEntity> model;

    public LoadReservationListCommand(DefaultListModel<ReservationEntity> model) {
        this.model = model;
    }

    @Override
    public boolean execute() {
        model.clear();
        RepositoryManager repo = RepositoryManager.getInstance();

        List<ReservationEntity> all = repo.reservations.findAll();
        for (ReservationEntity r : all) {
            if (!r.isReturned()) {
                model.addElement(r);
            }
        }
        return true;
    }
}
