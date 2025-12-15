package command;

import Repository.RepositoryManager;
import entity.LectureEntity;
import entity.ResourceEntity;

import java.util.List;

public class LoadResourceListCommand implements Command {

    private final List<String> output;

    public LoadResourceListCommand(List<String> outputList) {
        this.output = outputList;
    }

    @Override
    public boolean execute() {
        output.clear();

        RepositoryManager repo = RepositoryManager.getInstance();

        for (LectureEntity le : repo.lectures.findAll()) {
            output.add("강의실 - %s / deposit=%d / available=%s"
                    .formatted(le.getName(), le.getDeposit(), le.isAvailable()));
        }

        for (ResourceEntity re : repo.resources.findAll()) {
            output.add("물품 - %s / deposit=%d"
                    .formatted(re.getName(), re.getDeposit()));
        }

        return true;
    }
}
