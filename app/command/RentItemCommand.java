package command;

import Repository.RepositoryManager;
import entity.ReservationEntity;

import java.util.Date;

public class RentItemCommand implements Command {

    private final String userId;
    private final String userName;
    private final String itemName;
    private final Date startDate;
    private final Date expectedReturnDate;

    public RentItemCommand(String userId, String userName,
                           String itemName, Date startDate, Date expectedReturnDate) {

        this.userId = userId;
        this.userName = userName;
        this.itemName = itemName;
        this.startDate = startDate;
        this.expectedReturnDate = expectedReturnDate;
    }

    @Override
    public boolean execute() {
        RepositoryManager repo = RepositoryManager.getInstance();

        ReservationEntity r = new ReservationEntity(
                userId,
                userName,
                itemName,
                "ITEM",
                startDate,
                expectedReturnDate,
                null,
                null
        );

        repo.reservations.save(r);
        return true;
    }
}
