package command;

import Repository.RepositoryManager;
import entity.LectureEntity;
import entity.ResourceEntity;
import reservation.ReservationManager;

public class DeleteResourceCommand implements Command {

    private final String type;
    private final String name;

    public DeleteResourceCommand(String type, String name) {
        this.type = type;
        this.name = name;
    }

    @Override
    public boolean execute() {
        RepositoryManager repo = RepositoryManager.getInstance();

        if ("LECTURE".equals(type)) {
            repo.lectures.deleteByName(name);
        } else {
            repo.resources.deleteByName(name);
        }

        return ReservationManager.getInstance().removeResourceByName(name);
    }
}
