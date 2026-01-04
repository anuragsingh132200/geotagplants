import React from 'react';
import { format } from 'date-fns';
import { Trash2, Search, SortAsc, SortDesc } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import { setFilters, deletePlant } from '../../store/slices/plantsSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import { FilterOptions } from '../../types';
import './PlantList.css';

const PlantList: React.FC = () => {
  const dispatch = useAppDispatch();
  const plants = useAppSelector((state) => state.plants.plants);
  const filters = useAppSelector((state) => state.plants.filters);

  const handleFilterChange = (updates: Partial<FilterOptions>) => {
    dispatch(setFilters(updates));
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      dispatch(deletePlant(id));
      dispatch(
        addNotification({
          type: 'success',
          message: 'Plant deleted successfully',
        })
      );
    }
  };

  const toggleSortOrder = () => {
    handleFilterChange({
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  // Filter and sort plants
  const filteredPlants = React.useMemo(() => {
    let result = [...plants];

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter((plant) =>
        plant.imageName.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          comparison =
            new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case 'latitude':
          comparison = a.latitude - b.latitude;
          break;
        case 'longitude':
          comparison = a.longitude - b.longitude;
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [plants, filters]);

  return (
    <div className="plant-list">
      <div className="plant-list-header">
        <h2>Plant Inventory ({plants.length})</h2>
      </div>

      <div className="plant-list-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search plants..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
          />
        </div>

        <div className="sort-controls">
          <select
            value={filters.sortBy}
            onChange={(e) =>
              handleFilterChange({ sortBy: e.target.value as FilterOptions['sortBy'] })
            }
            className="sort-select"
          >
            <option value="date">Upload Date</option>
            <option value="latitude">Latitude</option>
            <option value="longitude">Longitude</option>
          </select>

          <button
            className="btn-icon"
            onClick={toggleSortOrder}
            title={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {filters.sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
          </button>
        </div>
      </div>

      {filteredPlants.length === 0 ? (
        <div className="plant-list-empty">
          <p>
            {filters.searchTerm
              ? 'No plants match your search'
              : 'No plants uploaded yet'}
          </p>
        </div>
      ) : (
        <div className="plant-grid">
          {filteredPlants.map((plant) => (
            <div key={plant.id} className="plant-card">
              <div className="plant-card-image">
                <img src={plant.imageUrl} alt={plant.imageName} />
              </div>
              <div className="plant-card-content">
                <h3 className="plant-card-title">{plant.imageName}</h3>
                <div className="plant-card-info">
                  <div className="info-item">
                    <span className="info-label">Lat:</span>
                    <span className="info-value">{plant.latitude.toFixed(5)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Lon:</span>
                    <span className="info-value">{plant.longitude.toFixed(5)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Uploaded:</span>
                    <span className="info-value">
                      {format(new Date(plant.uploadedAt), 'PP')}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(plant.id, plant.imageName)}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlantList;
