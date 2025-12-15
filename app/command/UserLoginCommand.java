package command;

import Repository.RepositoryManager;
import entity.UserEntity;

public class UserLoginCommand implements Command {

    private final String studentId;
    private final String name;
    private UserEntity result;         // 로그인 결과

    public UserLoginCommand(String studentId, String name) {
        this.studentId = studentId;
        this.name = name;
    }

    public UserEntity getResult() {
        return result;
    }

    @Override
    public boolean execute() {

        RepositoryManager repo = RepositoryManager.getInstance();

        // DB에서 사용자 조회
        UserEntity user = repo.users.findByField("studentId", studentId);

        // 없으면 신규 생성
        if (user == null) {
            user = new UserEntity(studentId, name);
            repo.users.save(user);
        }

        result = user;
        return true;
    }
}
