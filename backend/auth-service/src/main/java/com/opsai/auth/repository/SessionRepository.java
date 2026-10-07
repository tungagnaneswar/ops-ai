package com.opsai.auth.repository;

import com.opsai.auth.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Session> findByRefreshToken(String refreshToken);

    Optional<Session> findByIdAndUserId(Long id, Long userId);

    @Modifying
    @Transactional
    void deleteByRefreshToken(String refreshToken);

    @Modifying
    @Transactional
    void deleteByUserId(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Session s WHERE s.user.id = :userId AND s.id <> :sessionId")
    void deleteByUserIdAndIdNot(@Param("userId") Long userId, @Param("sessionId") Long sessionId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Session s WHERE s.user.id = :userId AND s.refreshToken <> :refreshToken")
    void deleteByUserIdAndRefreshTokenNot(@Param("userId") Long userId, @Param("refreshToken") String refreshToken);

    @Modifying
    @Transactional
    void deleteByExpiresAtBefore(OffsetDateTime now);
}
