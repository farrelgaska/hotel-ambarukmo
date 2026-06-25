package com.hotel.abstracts.service;

import com.hotel.abstracts.BaseEntity;
import com.hotel.exception.ResourceNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * BaseService abstract class demonstrating Abstraction and Generics.
 * Provides default implementations for standard CRUD operations, 
 * reducing boilerplate code in concrete service classes.
 */
public abstract class BaseService<T extends BaseEntity, ID> {

    /**
     * Subclasses must provide the repository bean.
     */
    protected abstract JpaRepository<T, ID> getRepository();

    /**
     * Subclasses must provide the entity name for error messages.
     */
    protected abstract String getEntityName();

    public List<T> findAll() {
        return getRepository().findAll();
    }

    public T findByIdOrThrow(ID id) {
        return getRepository().findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(getEntityName() + " tidak ditemukan dengan id: " + id));
    }

    public T save(T entity) {
        return getRepository().save(entity);
    }

    public void deleteById(ID id) {
        T entity = findByIdOrThrow(id);
        getRepository().delete(entity);
    }
}
