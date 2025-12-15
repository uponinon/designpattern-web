package command;

import Repository.RepositoryManager;
import entity.ResourceEntity;

import javax.swing.*;
import java.util.List;

public class LoadRentableItemListCommand implements Command {

    private final DefaultListModel<String> model;
    private final List<ResourceEntity> itemsHolder;

    public LoadRentableItemListCommand(DefaultListModel<String> model,
                                       List<ResourceEntity> itemsHolder) {
        this.model = model;
        this.itemsHolder = itemsHolder;
    }

    @Override
    public boolean execute() {
        RepositoryManager repo = RepositoryManager.getInstance();

        // 최신 DB 자료 불러오기
        List<ResourceEntity> items = repo.resources.findAll();
        itemsHolder.clear();
        itemsHolder.addAll(items);

        model.clear();

        for (ResourceEntity r : items) {
            model.addElement(
                    "%s (대여기간 %d일 / 보증금 %d원)"
                            .formatted(r.getName(), r.getRentalPeriod(), r.getDeposit())
            );
        }

        return true;
    }
}
