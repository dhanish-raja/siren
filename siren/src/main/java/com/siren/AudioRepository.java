package com.siren;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AudioRepository  extends JpaRepository<AudioEntity,Long> {
}