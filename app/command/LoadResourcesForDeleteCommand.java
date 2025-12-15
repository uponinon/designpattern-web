package command;

import Repository.RepositoryManager;
import entity.LectureEntity;
import entity.ResourceEntity;
import ui.Main.admin.AdminDeletePanel.ResourceOption;

import javax.swing.*;

public class LoadResourcesForDeleteCommand implements Command {

    private final DefaultListModel<ResourceOption> model;

    public LoadResourcesForDeleteCommand(DefaultListModel<ResourceOption> model) {
        this.model = model;
    }

    @Override
    public boolean execute() {
        model.clear();
        RepositoryManager repo = RepositoryManager.getInstance();

        for (LectureEntity le : repo.lectures.findAll()) {
            String label = "강의실 - " + le.getName() + " (avail=" + le.isAvailable() + ")";
            model.addElement(new ResourceOption("LECTURE", le.getName(), label));
        }

        for (ResourceEntity re : repo.resources.findAll()) {
            String label = "물품 - " + re.getName();
            model.addElement(new ResourceOption("ITEM", re.getName(), label));
        }

        return true;
    }
}
