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

    public long insert(String username, boolean repeated, int score) throws SQLException {
        final String sql = "INSERT INTO submissions (username, repeated, score) VALUES (?, ?, ?) RETURNING id";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, username);
            ps.setBoolean(2, repeated);
            ps.setInt(3, score);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong(1);
                }
                throw new SQLException("Insert did not return an id");
            }
        }
    }

    public List<Submission> findAll() throws SQLException {
        final String sql = "SELECT id, username, repeated, score FROM submissions ORDER BY id";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<Submission> list = new ArrayList<>();
            while (rs.next()) {
                long id = rs.getLong("id");
                String username = rs.getString("username");
                boolean repeated = rs.getBoolean("repeated");
                int score = rs.getInt("score");
                list.add(new Submission(id, username, repeated, score));
            }
            return list;
        }
    }
}
