package command;

import Repository.RepositoryManager;
import entity.LectureEntity;

import javax.swing.*;
import java.util.List;

public class LoadLectureRoomListCommand implements Command {

    private final DefaultListModel<String> model;
    private final List<LectureEntity> roomHolder; // ReserveRoomPanel.rooms

    public LoadLectureRoomListCommand(DefaultListModel<String> model,
                                      List<LectureEntity> roomHolder) {
        this.model = model;
        this.roomHolder = roomHolder;
    }

    @Override
    public boolean execute() {

        RepositoryManager repo = RepositoryManager.getInstance();

        roomHolder.clear();
        repo.lectures.findAll().forEach(roomHolder::add);

        model.clear();
        for (LectureEntity r : roomHolder) {
            model.addElement("%s (보증금 %d원)".formatted(r.getName(), r.getDeposit()));
        }

        return true;
    }
}
