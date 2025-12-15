// src/user/Admin.java
package user;

import Repository.RepositoryManager;
import entity.LectureEntity;
import entity.ResourceEntity;
import manager.LectureResourceFactory;
import manager.ResourceType;
import reservation.ReservationManager;
import resource.AutoRecordingRoomDecorator;
import resource.LectureRoomFeature;
import resource.LectureRoomSize;
import resource.ProjectorRoomDecorator;
import resource.ReservableResource;
import resource.SimpleItem;

public class Admin extends User {
  private String adminId;

  public Admin(String studentId, String name, String adminId) {
    super(studentId, name);
    this.adminId = adminId;
  }

  public boolean registerResource(ReservationManager manager, ResourceType type, String name, int deposit) {
    // 기본 크기(MEDIUM)와 특수 옵션 없음으로 위임
    return registerResource(manager, type, name, deposit, LectureRoomSize.MEDIUM, LectureRoomFeature.NONE);
  }

  // Factory + Decorator 패턴: 강의실 사이즈와 특수 옵션까지 지정해 등록
  public boolean registerResource(
      ReservationManager manager,
      ResourceType type,
      String name,
      int deposit,
      LectureRoomSize size
  ) {
    return registerResource(manager, type, name, deposit, size, LectureRoomFeature.NONE);
  }

  public boolean registerResource(
      ReservationManager manager,
      ResourceType type,
      String name,
      int deposit,
      LectureRoomSize size,
      LectureRoomFeature feature
  ) {

    RepositoryManager repositoryManager = RepositoryManager.getInstance();

    switch (type) {

      case LECTURE:
        if (repositoryManager.lectures.findByName(name) != null) {
          return false;
        }

        LectureResourceFactory lectureFactory = new LectureResourceFactory();
        repositoryManager.lectures.save(new LectureEntity(name, deposit, true));
        // Factory가 Resource를 반환하지만 강의실은 ReservableResource이므로 캐스팅
        ReservableResource room = (ReservableResource) lectureFactory.createResource(name, deposit, size);
        room = switch (feature) {
          case PROJECTOR -> new ProjectorRoomDecorator(room);
          case AUTO_RECORDING -> new AutoRecordingRoomDecorator(room);
          case NONE -> room;
        };
        manager.addResource(room);
        return true;

      case ITEM:
        if (repositoryManager.resources.findByName(name) != null) {
          return false;
        }

        repositoryManager.resources.save(new ResourceEntity(name, deposit));
        manager.addResource(new SimpleItem(name, deposit));
        return true;
    }
    return false;
  }


  // [정규] enum 버전(과거 선택과 궁합 좋음)
  /* public boolean registerResource(ReservationManager manager, ResourceType type, String name, int deposit) {

    boolean saved = ResourceFileWriter.appendResource(type.name(), name, deposit);
    if (!saved) {
      System.out.println("[실패] 파일에 동일한 이름의 자원이 이미 존재합니다: " + name);
      return false;
    }

    manager.registerResource(String.valueOf(type), name, deposit);
    System.out.println("[성공] 자원 등록 및 파일 저장 완료!");
    return true;


      RepositoryManager repositoryManager = RepositoryManager.getInstance();
      switch(type){
          case LECTURE:
              System.out.println(type);
              if(repositoryManager.lectures.findByName(name) != null) {
                  repositoryManager.lectures.save(new LectureEntity(name, deposit, true));
                  return true;
              }
            return false;
          case    ITEM:
              System.out.println(type);
              //Mongo DB 연결 코드//
              if(repositoryManager.lectures.findByName(name) != null) {
                  repositoryManager.resources.save(new ResourceEntity(name, deposit));
                    return true;
              }
              return false;
      }

      //*********************수정해야함
      return true;
  }*/


  public void deleteResource(resource.Resource resource) {}
  public void viewAllResources() {

  }
  public void modifyResource(resource.Resource resource) {}

}
