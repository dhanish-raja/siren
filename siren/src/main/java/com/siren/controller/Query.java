package com.siren.controller;

import com.siren.model.ECase;
import com.siren.service.QueryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/siren/db")
public class Query {

    private final QueryService queryService;

    public Query(QueryService queryService) {
        this.queryService = queryService;
    }

    @GetMapping("/{dept}")
    public List<ECase> getCasesByDepartment(@PathVariable("dept") String dept) {
        return queryService.getCasesByDepartment(dept);
    }
}
