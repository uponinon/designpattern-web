package command;

import Repository.RepositoryManager;
import entity.LectureEntity;
import entity.ResourceEntity;
import reservation.ReservationManager;
import resource.RentableResource;
import resource.ReservableResource;

public class EditResourceCommand implements Command {

    private final String resourceName;
    private final int newDeposit;
    private final Integer rentalPeriod; // 물품일 때만 사용

    public EditResourceCommand(String resourceName, int newDeposit, Integer rentalPeriod) {
        this.resourceName = resourceName;
        this.newDeposit = newDeposit;
        this.rentalPeriod = rentalPeriod;
    }

    @Override
    public boolean execute() {

        RepositoryManager repo = RepositoryManager.getInstance();
        ReservationManager rm = ReservationManager.getInstance();

        // 1) Manager 내부 Resource 업데이트
        rm.getAllResources().stream()
                .filter(r -> r.getName().equals(resourceName))
                .forEach(r -> {
                    r.setDeposit(newDeposit);

                    if (r instanceof RentableResource rent && rentalPeriod != null) {
                        rent.setRentalPeriod(rentalPeriod);
                    }
                });

        // 2) DB 업데이트 (강의실)
        LectureEntity le = repo.lectures.findByName(resourceName);
        if (le != null) {
            le.setDeposit(newDeposit);
            repo.lectures.update(le);
        }

        // 3) DB 업데이트 (물품)
        ResourceEntity re = repo.resources.findByName(resourceName);
        if (re != null) {
            re.setDeposit(newDeposit);
            if (rentalPeriod != null) re.setRentalPeriod(rentalPeriod);
            repo.resources.update(re);
        }

        return true;
    }
}
