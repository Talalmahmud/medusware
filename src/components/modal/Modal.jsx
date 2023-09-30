import React, { useState, useEffect, useRef, useCallback } from "react";

const YourComponent = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showEvenOnly, setShowEvenOnly] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null);
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);

  const fetchData = async (page) => {
    try {
      const response = await fetch(
        `https://contact.mediusware.com/api/contacts/?page=${page}`
      );
      const result = await response.json();
      setData((prevData) => [...prevData, ...result.results]);
      setHasMore(result.next !== null);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pageNumber);
  }, [pageNumber]);

  useEffect(() => {
    let filtered = data;

    if (filter === "us") {
      filtered = filtered.filter(
        (item) => item.country.name === "United States"
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.country.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (showEvenOnly) {
      filtered = filtered.filter((item) => parseInt(item.phone, 10) % 2 === 0);
    }

    setFilteredData(filtered);
  }, [data, filter, searchTerm, showEvenOnly]);

  const handleFilterClick = (newFilter) => {
    setFilter(newFilter);
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleShowEvenChange = () => {
    setShowEvenOnly(!showEvenOnly);
  };

  const openPhoneModal = (phoneNumber) => {
    setSelectedPhoneNumber(phoneNumber);
    setPhoneModalVisible(true);
  };

  const closePhoneModal = () => {
    setSelectedPhoneNumber(null);
    setPhoneModalVisible(false);
  };

  const observer = useRef();
  const lastContactRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setLoading(true);
          setPageNumber((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <div className="container mt-5">
      <div className="row justify-content-center mt-5">
        <div className="d-flex justify-content-center gap-3">
          <button
            className="btn btn-lg btn-outline-primary"
            type="button"
            onClick={toggleModal}
          >
            All Contacts
          </button>

          <button
            className="btn btn-lg btn-outline-warning"
            type="button"
            onClick={toggleModal}
          >
            US Contacts
          </button>
        </div>
      </div>
      <div
        className={`modal ${modalVisible ? "show" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={{ display: modalVisible ? "block" : "none" }}
      >
        <div
          className="modal-dialog"
          role="document"
          style={{ maxHeight: "80vh" }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Modal </h5>
              <button
                type="button"
                className="close"
                onClick={toggleModal}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div
              className="modal-body"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by country name"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              <div
                className="btn-group mb-3"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 100,
                  background: "white",
                }}
              >
                <button
                  className={`btn btn-outline-primary ${
                    filter === "all" ? "active" : ""
                  }`}
                  onClick={() => handleFilterClick("all")}
                  type="button"
                >
                  All Contacts
                </button>
                <button
                  className={`btn btn-outline-warning ${
                    filter === "us" ? "active" : ""
                  }`}
                  onClick={() => handleFilterClick("us")}
                  type="button"
                >
                  US Contacts
                </button>
                <button
                  className={`btn btn-outline-primary ${
                    filter === "close" ? "active" : ""
                  }`}
                  onClick={() => handleFilterClick("close")}
                  type="button"
                >
                  Close
                </button>
              </div>
              <div className="overflow-auto">
                {filteredData.map((item, index) => (
                  <div
                    className="row justify-content-between mb-2"
                    key={index}
                    onClick={() => openPhoneModal(item.phone)}
                    style={{ cursor: "pointer" }}
                    ref={
                      index === filteredData.length - 1 ? lastContactRef : null
                    }
                  >
                    <div className="col">{item.phone}</div>
                    <div className="col">{item.country.name}</div>
                  </div>
                ))}
                {loading && <div>Loading...</div>}
              </div>
            </div>
            <div className="modal-footer">
              <input
                type="checkbox"
                className="form-check-input"
                id="showEven"
                checked={showEvenOnly}
                onChange={handleShowEvenChange}
              />
              <label
                className="form-check-label"
                htmlFor="showEven"
                style={{ marginRight: "18rem" }}
              >
                Only even
              </label>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={toggleModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Phone Modal */}
      <div
        className={`modal ${phoneModalVisible ? "show" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={{ display: phoneModalVisible ? "block" : "none" }}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Phone Details</h5>
              <button
                type="button"
                className="close"
                onClick={closePhoneModal}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <p>Phone Number: {selectedPhoneNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourComponent;
