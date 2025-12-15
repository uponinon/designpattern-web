package command;

import reservation.ReservationManager;

import javax.swing.*;

public class LoadResourcesForEditCommand implements Command {

    private final DefaultListModel<String> model;

    public LoadResourcesForEditCommand(DefaultListModel<String> model) {
        this.model = model;
    }

    @Override
    public boolean execute() {

        model.clear();

        ReservationManager rm = ReservationManager.getInstance();

        rm.getAllResources().forEach(r ->
                model.addElement(
                        "%s (%s) | 보증금 %d"
                                .formatted(
                                        r.getName(),
                                        r.getClass().getSimpleName(),
                                        r.getDeposit()
                                )
                )
        );

        return true;
    }
}
