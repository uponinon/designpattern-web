package command;

import Repository.RepositoryManager;
import entity.AdminEntity;
import user.Admin;

public class AdminLoginCommand implements Command {

    private final String studentId;
    private final String name;
    private Admin result;               // 로그인 성공 시 반환 값

    public AdminLoginCommand(String studentId, String name) {
        this.studentId = studentId;
        this.name = name;
    }

    public Admin getResult() {
        return result;
    }

    @Override
    public boolean execute() {

        RepositoryManager repo = RepositoryManager.getInstance();

        // 1) 마스터 관리자(99999999)
        if (studentId.equals("99999999")) {
            result = new Admin(studentId, name, studentId);
            return true;
        }

        // 2) 추가 관리자(9999)
        if (studentId.equals("9999")) {
            AdminEntity e = repo.admins.findByField("studentId", "9999");
            if (e == null) {
                e = new AdminEntity("9999", "관리자", "9999");
                repo.admins.save(e);
            }
            result = new Admin(e.getStudentId(), e.getName(), e.getAdminId());
            return true;
        }

        // 3) DB에서 관리자 조회
        AdminEntity entity = repo.admins.findByField("studentId", studentId);
        if (entity != null) {
            result = new Admin(entity.getStudentId(), entity.getName(), entity.getAdminId());
            return true;
        }

        return false; // 관리자 아님
    }
}
