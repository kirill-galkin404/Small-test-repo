import React, { useEffect, useState } from 'react';
import { getStats } from '../api/endpoints';

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [tagList, setTagList] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getStats().then(
      (data) => {
        if (cancelled) return;
        setStats(data);
        const list = Object.keys((data && data.tags) || {}).map((name) => ({
          name,
          count: data.tags[name],
        }));
        list.sort((a, b) => b.count - a.count);
        setTagList(list);
      },
      () => {}
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h3>Stats</h3>
      {stats && (
        <div className="row">
          <div className="col-sm-3">
            <div className="panel panel-default stat">
              <div className="panel-body"><h2>{stats.total}</h2>Total</div>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="panel panel-success stat">
              <div className="panel-body"><h2>{stats.done}</h2>Done</div>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="panel panel-warning stat">
              <div className="panel-body"><h2>{stats.dueToday}</h2>Due today</div>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="panel panel-danger stat">
              <div className="panel-body"><h2>{stats.overdue}</h2>Overdue</div>
            </div>
          </div>
        </div>
      )}

      <h4>Progress</h4>
      <div className="progress">
        <div
          className="progress-bar progress-bar-success"
          style={{ width: (stats ? stats.percentDone : 0) + '%' }}
        >
          {stats ? `${stats.percentDone}%` : ''}
        </div>
      </div>

      <h4>Tags</h4>
      <table className="table table-condensed table-striped" style={{ width: 300 }}>
        <tbody>
          {tagList.map((t) => (
            <tr key={t.name}>
              <td>#{t.name}</td>
              <td className="text-right">{t.count}</td>
            </tr>
          ))}
          {tagList.length === 0 && (
            <tr>
              <td className="text-muted">No tags yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
