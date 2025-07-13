package com.example.printnparcel.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Printer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String location;
    private double pricePerPage;
    private boolean supportsColor;
    private String additionalNotes;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;
}
