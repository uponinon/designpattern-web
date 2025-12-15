package resource;

import java.util.Date;
import user.User;

/**
 * Decorator that adds projector capability to a lecture room.
 */
public class ProjectorRoomDecorator extends ReservableDecorator {

  public ProjectorRoomDecorator(ReservableResource decorated) {
    super(decorated);
  }

  public void enableProjector() {
    // no-op placeholder for projector feature
  }

  @Override
  public String getName() {
    return decorated.getName() + " [\ube54\ud504\ub85c\uc81d\ud130]";
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
