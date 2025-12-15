package resource;

import java.util.Date;
import user.User;

/**
 * 대형 강의실 (Decorator 패턴 적용).
 */
public class LargeLectureRoomDecorator extends ReservableDecorator {

  public LargeLectureRoomDecorator(ReservableResource decorated) {
    super(decorated);
  }

  @Override
  public String getName() {
    return decorated.getName() + " [대형]";
  }

  @Override
  public int getDeposit() {
    return decorated.getDeposit();
  }

  @Override
  public void setDeposit(int deposit) {
    decorated.setDeposit(deposit);
  }

  @Override
  public boolean reserve(Date date, TimeSlot slot, User user) {
    return decorated.reserve(date, slot, user);
  }

  @Override
  public void cancel(Date date, TimeSlot slot, User user) {
    decorated.cancel(date, slot, user);
  }

  @Override
  public void showAvailability(Date date) {
    decorated.showAvailability(date);
  }

  @Override
  public boolean isAvailable() {
    return decorated.isAvailable();
  }

  @Override
  public void setAvailable(boolean available) {
    decorated.setAvailable(available);
  }
}
