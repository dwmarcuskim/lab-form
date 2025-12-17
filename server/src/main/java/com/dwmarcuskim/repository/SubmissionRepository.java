package com.dwmarcuskim.repository;

import com.dwmarcuskim.dto.Submission;
import jakarta.enterprise.context.ApplicationScoped;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class SubmissionRepository {

    private final DataSource dataSource;

    public SubmissionRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public long insert(String username, int repeated, double score) throws SQLException {
        final String sql = "INSERT INTO submissions (username, repeated, score) VALUES (?, ?, ?) RETURNING submission_id";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, username);
            ps.setInt(2, repeated);
            ps.setDouble(3, score);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong(1);
                }
                throw new SQLException("Insert did not return an id");
            }
        }
    }

    public List<Submission> findAll() throws SQLException {
        final String sql = "SELECT submission_id, username, repeated, score FROM submissions ORDER BY submission_id";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<Submission> list = new ArrayList<>();
            while (rs.next()) {
                long id = rs.getLong("submission_id");
                String username = rs.getString("username");
                int repeated = rs.getInt("repeated");
                double score = rs.getDouble("score");
                list.add(new Submission(id, username, repeated, score));
            }
            return list;
        }
    }
}
