package command;

import Repository.RepositoryManager;
import entity.ReservationEntity;

import javax.swing.*;
import java.text.SimpleDateFormat;
import java.util.List;

public class LoadMyReservationsCommand implements Command {

    private static final SimpleDateFormat DATE = new SimpleDateFormat("yyyy-MM-dd");
    private static final SimpleDateFormat DATETIME = new SimpleDateFormat("yyyy-MM-dd HH:mm");

    private final DefaultListModel<String> model;
    private final List<ReservationEntity> holder;   // UI가 실제 객체 접근할 리스트
    private final String userId;

    public LoadMyReservationsCommand(DefaultListModel<String> model,
                                     List<ReservationEntity> holder,
                                     String userId) {
        this.model = model;
        this.holder = holder;
        this.userId = userId;
    }

    @Override
    public boolean execute() {

        RepositoryManager repo = RepositoryManager.getInstance();
        model.clear();
        holder.clear();

        List<ReservationEntity> list = repo.reservations.findAll().stream()
                .filter(r -> userId.equals(r.getUserId()))
                .filter(r -> !r.isReturned())
                .toList();

        holder.addAll(list);

        for (ReservationEntity r : list) {

            String text;

            if ("LECTURE".equals(r.getResourceType())) {
                text = "%s | %s | %s"
                        .formatted(
                                r.getResourceName(),
                                DATE.format(r.getStartDate()),
                                r.getTimeSlot() == null ? "" : r.getTimeSlot()
                        );

            } else {
                text = "%s | 대여 %s | 반납 예정: %s"
                        .formatted(
                                r.getResourceName(),
                                DATETIME.format(r.getStartDate()),
                                DATETIME.format(r.getEndDate())
                        );
            }

            model.addElement(text);
        }

        return true;
    }
}
