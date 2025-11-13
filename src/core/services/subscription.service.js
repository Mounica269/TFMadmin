import { utils } from "core/helper";
import axios from "../config/axios";
import {
  REPORT_SUBSCRIPTION_EXPIRY,
  EXPORT_SUBSCRIPTION_EXPIRY,
} from "./apiURL.service";

const Subscription = {
  /**
   * Get subscription expiry report with filters
   * @param {Object} filter - Filter parameters including page, limit, dates, status, etc.
   * @returns {Promise}
   */
  getExpiryReport: function (filter) {
    return axios
      .post(REPORT_SUBSCRIPTION_EXPIRY, filter)
      .then((resp) => resp.data)
      .catch((error) => utils.showErrMsg(utils.handleErr(error)));
  },

  /**
   * Export subscription expiry report
   * @param {Object} filter - Filter parameters
   * @param {Array} columns - Columns to include in export
   * @returns {Promise}
   */
  exportExpiryReport: function (filter, columns) {
    const exportPayload = {
      filter,
      exportArr: columns,
    };
    return axios
      .post(EXPORT_SUBSCRIPTION_EXPIRY, exportPayload, {
        responseType: "blob",
      })
      .then((resp) => resp)
      .catch((error) => utils.showErrMsg(utils.handleErr(error)));
  },

  /**
   * Get expiry statistics for dashboard (counts only)
   * Returns count of subscriptions expiring in specific day ranges
   * @returns {Promise}
   */
  getExpiryStats: async function () {
    try {
      // Fetch counts for each time period with exclusive ranges
      // Use limit: 1 to minimize data transfer (we only need the count from pagination)
      const [stats7, stats15, stats30] = await Promise.all([
        this.getExpiryReport({ page: 1, limit: 1, expiryStatus: ['EXPIRED', 'EXPIRING_7'] }), // 0-7 days only
        this.getExpiryReport({ page: 1, limit: 1, expiryStatus: ['EXPIRING_15'] }), // 8-15 days only
        this.getExpiryReport({ page: 1, limit: 1, expiryStatus: ['EXPIRING_30'] }), // 16-30 days only
      ]);

      return {
        success: true,
        data: {
          expiring7Days: stats7?.pagination?.totalCount || stats7?.pagination?.total || 0,
          expiring15Days: stats15?.pagination?.totalCount || stats15?.pagination?.total || 0,
          expiring30Days: stats30?.pagination?.totalCount || stats30?.pagination?.total || 0,
        }
      };
    } catch (error) {
      console.error('Error fetching expiry stats:', error);
      utils.showErrMsg('Failed to fetch subscription statistics');
      return { success: false, data: null };
    }
  },

  /**
   * Get subscriptions expiring soon for dashboard widget
   * @param {Number} days - Days to filter (7, 15, or 30)
   * @param {Number} page - Page number (default 1)
   * @param {Number} limit - Records per page (default 10)
   * @returns {Promise}
   */
  getExpiringSoon: async function (days = 30, page = 1, limit = 10) {
    try {
      // Map days to correct expiry status codes with exclusive ranges
      const statusMap = {
        7: ['EXPIRED', 'EXPIRING_7'],    // 0-7 days only
        15: ['EXPIRING_15'],              // 8-15 days only
        30: ['EXPIRING_30'],              // 16-30 days only
      };

      const expiryStatus = statusMap[days] || statusMap[30];

      const response = await this.getExpiryReport({
        page: page,
        limit: limit,
        expiryStatus: expiryStatus
      });

      if (response && (response.meta?.code === 200 || response.success)) {
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || {
            total: 0,
            page: page,
            limit: limit,
            pages: 0
          }
        };
      }

      return { success: false, data: [], pagination: null };
    } catch (error) {
      console.error('Error fetching expiring subscriptions:', error);
      utils.showErrMsg('Failed to fetch expiring subscriptions');
      return { success: false, data: [], pagination: null };
    }
  },
};

export default Subscription;
