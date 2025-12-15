package Repository;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import entity.LectureEntity;
import observer.EventType;

import static com.mongodb.client.model.Filters.eq;

public class LectureRepository {

    private final MongoCollection<LectureEntity> collection;

    public LectureRepository(MongoDatabase db, org.bson.codecs.configuration.CodecRegistry codecRegistry) {
        this.collection = db.getCollection("lectures", LectureEntity.class)
            .withCodecRegistry(codecRegistry);
    }

    // CREATE
    public void save(LectureEntity entity) {
        collection.insertOne(entity);
        RepositoryManager.getInstance().notifyObservers(EventType.RESOURCE_ADDED);
    }

    // READ
    public LectureEntity findByName(String name) {
        return collection.find(eq("name", name)).first();
    }

    public Iterable<LectureEntity> findAll() {
        return collection.find();
    }

    // UPDATE
    public void update(LectureEntity entity) {
        collection.replaceOne(eq("name", entity.getName()), entity);
        RepositoryManager.getInstance().notifyObservers(EventType.RESOURCE_UPDATED);
    }

    // DELETE
    public void deleteByName(String name) {
        collection.deleteOne(eq("name", name));
        RepositoryManager.getInstance().notifyObservers(EventType.RESOURCE_REMOVED);
    }
}
