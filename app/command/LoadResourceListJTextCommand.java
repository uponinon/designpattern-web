package command;

import Repository.RepositoryManager;
import entity.LectureEntity;
import entity.ResourceEntity;

import javax.swing.*;

public class LoadResourceListJTextCommand implements Command{
    private final JTextArea area;

    public LoadResourceListJTextCommand(JTextArea area) {
        this.area = area;
    }

    @Override
    public boolean execute() {

        RepositoryManager repo = RepositoryManager.getInstance();

        StringBuilder sb = new StringBuilder();

        sb.append("=== 강의실 목록 ===\n");
        for (LectureEntity le : repo.lectures.findAll()) {
            sb.append("- ")
                    .append(le.getName())
                    .append(" / deposit=")
                    .append(le.getDeposit())
                    .append(" / available=")
                    .append(le.isAvailable())
                    .append("\n");
        }

        sb.append("\n=== 대여 품목 목록 ===\n");
        for (ResourceEntity re : repo.resources.findAll()) {
            sb.append("- ")
                    .append(re.getName())
                    .append(" / deposit=")
                    .append(re.getDeposit())
                    .append("\n");
        }

        area.setText(sb.toString());

        return true;
    }
}