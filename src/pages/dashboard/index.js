import { PROFILE_URL } from "core/services/apiURL.service";
import { connect } from "react-redux";
import { useEffect, useState } from "react";
import { commonService, usersService } from "core/services";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Highcharts3d from "highcharts/highcharts-3d";
import HighchartsExport from "highcharts/modules/exporting";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { IMAGE_APPROVALS_PATH } from "pages/routes/routes";
import ExpiringSubscriptionsWidget from "components/dashboard/ExpiringSubscriptionsWidget";

Highcharts3d(Highcharts);
HighchartsExport(Highcharts);

const Dashboard = (props) => {
  const { commonData } = props;

  const [registeredUsersType, setRegisteredUsersType] = useState({ type: 10 });
  const [dashboardData, setDashboardData] = useState({});
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [registerUsersWeek, setRegisteredUsersWeek] = useState([]);
  const [registerUserMonth, setRegisteredUsersMonth] = useState([]);
  const [filterTitle, setFilterTitle] = useState("DAY WISE ANALYSIS");
  const [filterType, setFilterType] = useState("day");
  const [planApiLoad, setPlanApiLoad] = useState(false);

  // const [subScriptionDataType, setSubScriptionDataType] = useState({
  //   type: 10,
  // });
  // const [subScriptionTitle, setSubScriptionTitle] = useState(
  //   "DATE WISE SALES ANALYSIS"
  // );
  // const [subScriptionType, setSubScriptionType] = useState("day");
  const [subScriptionData, setSubScriptionData] = useState([]);

  // const [subscriptionAnalysis, setSubScriptionAnalysis] = useState([]);

  // const [dateArr, setDateArr] = useState([]);

  // const [freePlan, setFreePlan] = useState([]);
  // const [premiumPlan, setPremiumPlan] = useState([]);
  // const [goldPlan, setGoldPlan] = useState([]);

  const [isComponentMounted, setComponentMounted] = useState(false);
  useEffect(() => {
    const handleChange = async () => {
      await loadDashboardDatas();
      getRegisteredUsers(filterType);
      getSubscription();
      // getSubscriptionDateWise(registeredUsersType);
    };
    if (isComponentMounted) {
      handleChange();
    }
  }, [isComponentMounted, commonData, filterType]);

  useEffect(() => {
    setComponentMounted(true);
  }, []);

  const usersSubScription = {
    chart: {
      type: "pie",
      options3d: {
        enabled: true,
        alpha: 45,
        beta: 0,
      },
    },
    title: {
      text: "Subscription Analysis",
    },
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        depth: 35,
        dataLabels: {
          enabled: true,
          format: "{point.name}",
        },
      },
    },
    series: [
      {
        type: "pie",
        name: "Plan",
        data: subScriptionData,
        showInLegend: true,
        // events: {
        //     click: (eve) => handleClick(eve)
        //     // click: function (event) {
        //     //     'event::', event.point.name);
        //     //     alert(
        //     //         this.name + ' clicked\n' +
        //     //         'value: ' + this.value + '\n' +
        //     //         'Alt: ' + event.altKey + '\n' +
        //     //         'Control: ' + event.ctrlKey + '\n' +
        //     //         'Meta: ' + event.metaKey + '\n' +
        //     //         'Shift: ' + event.shiftKey
        //     //     );
        //     // }
        // } // highlighted particulart list
      },
    ],
    exporting: {
      buttons: {
        contextButton: {
          menuItems: ["downloadPNG", "downloadJPEG"],
        },
      },
    },
    credits: {
      enabled: false,
    },
  };

  const registerUsers = {
    chart: {
      type: "column",
    },
    title: {
      text: filterTitle,
    },
    xAxis: {
      type: "datetime",
      crosshair: true,
      title: {
        text: filterType,
      },
      // tickInterval: 24 * 3600 * 1000
    },
    yAxis: {
      min: 0,
      title: {
        text: "Amount",
      },
    },
    tooltip: {
      // headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      // pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
      //     '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
      // footerFormat: '</table>',
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
      // series: {
      //   borderColor: "#303030",
      // },
    },
    series: [
      {
        showInLegend: false,
        name: "Day",
        type: "column",
        data: registeredUsers,
        color: "#B084FF ",
      },
      {
        showInLegend: false,
        name: "Week",
        type: "column",
        data: registerUsersWeek,
        color: "#B084FF ",
      },
      {
        showInLegend: false,
        name: "Month",
        type: "column",
        data: registerUserMonth,
        color: "#B084FF ",
      },
    ],
    exporting: {
      buttons: {
        contextButton: {
          menuItems: ["downloadPNG", "downloadJPEG"],
        },
      },
    },
    credits: {
      enabled: false,
    },
  };

  const getRegisteredUsers = async (filterType) => {
    const resp = await usersService.registeredUsers(registeredUsersType);
    if (resp && resp.meta.code === 200) {
      if (resp.data) {
        const registeredUserDayArr = [];
        const registeredUserWeekArr = [];
        const registeredUserMonthArr = [];
        resp.data.map((ele) => {
          if (filterType === "day" && registeredUsersType.type === 10) {
            const { date, count } = ele;
            const dateSplit = date.split("-");
            const string = dateSplit.reverse().join("-").toString();
            const indianDate = new Date(string);
            const indianDateGetMonth = indianDate.getUTCMonth();
            const indianDateGetDate = indianDate.getUTCDate();
            const indianDateGetYear = indianDate.getUTCFullYear();
            const utc = Date.UTC(
              indianDateGetYear,
              indianDateGetMonth,
              indianDateGetDate
            );
            registeredUserDayArr.push({ x: utc, y: parseFloat(count) });
          }
          if (filterType === "week" && registeredUsersType.type === 20) {
            const { endDate, count } = ele;
            const endDateSplit = endDate.split("-");
            const string = endDateSplit.reverse().join("-").toString();
            const indianDate = new Date(string);
            const indianDateGetMonth = indianDate.getUTCMonth();
            const indianDateGetDate = indianDate.getUTCDate();
            const indianDateGetYear = indianDate.getUTCFullYear();
            const utc = Date.UTC(
              indianDateGetYear,
              indianDateGetMonth,
              indianDateGetDate
            );
            registeredUserDayArr.push({ x: utc, y: parseFloat(count) });
          }
          if (filterType === "month" && registeredUsersType.type === 30) {
            const { endDate, count } = ele;
            const endDateSplit = endDate.split("-");
            const string = endDateSplit.reverse().join("-").toString();
            const indianDate = new Date(string);
            const indianDateGetMonth = indianDate.getUTCMonth();
            const indianDateGetDate = indianDate.getUTCDate();
            const indianDateGetYear = indianDate.getUTCFullYear();
            const utc = Date.UTC(
              indianDateGetYear,
              indianDateGetMonth,
              indianDateGetDate
            );
            registeredUserMonthArr.push({ x: utc, y: parseFloat(count) });
          }
          return true;
        });
        setRegisteredUsers(registeredUserDayArr);
        setRegisteredUsersWeek(registeredUserWeekArr);
        setRegisteredUsersMonth(registeredUserMonthArr);
      }
    }
  };

  const getSubscription = async () => {
    const resp = await usersService.subScriptionChart();
    if (resp && resp.meta.code === 200) {
      const subScriptionData = [];
      if (resp.data) {
        resp.data.map((ele) => {
          const { plan, count } = ele;
          subScriptionData.push({
            name: plan.split("PLAN").join("PLAN "),
            y: parseFloat(count),
          });
          return true;
        });
      }
      setSubScriptionData(subScriptionData);
    }
  };

  // const getSubscriptionDateWise = async (filterType) => {
  //   const resp = await usersService.subScriptionAnalyisChart(
  //     // subScriptionDataType
  //   );
  //   if (resp && resp.meta.code === 200) {
  //     if (resp.data) {
  //       // const setSubScriptionAnalysisArr = [];
  //       const freePlan = [];
  //       const premiumPlan = [];
  //       const goldPlan = [];

  //       const dataArr = [];
  //       resp.data.map((ele) => {
  //         if (filterType === "day"
  //         // && subScriptionDataType.type === 10
  //         ) {
  //           const { _id, data } = ele;
  //           const dateSplit = _id.split("-");
  //           const string = dateSplit.reverse().join("-").toString();
  //           const indianDate = new Date(string);
  //           const indianDateGetMonth = indianDate.getUTCMonth();
  //           const indianDateGetDate = indianDate.getUTCDate();
  //           const indianDateGetYear = indianDate.getUTCFullYear();
  //           const utc = Date.UTC(
  //             indianDateGetYear,
  //             indianDateGetMonth,
  //             indianDateGetDate
  //           );

  //           const formatYear = new Date(utc).getFullYear();
  //           const formatMonth = new Date(utc).getMonth();
  //           const formatDate = new Date(utc).getDate();

  //           const format = new Date(formatYear, formatMonth, formatDate);
  //           const momentDate = moment(format).format("ll");
  //           dataArr.push(momentDate);

  //           data.map((ele) => {
  //             const { plan } = ele;
  //             ele.date = _id;
  //             if (plan === "PLAN000") {
  //               freePlan.push(ele);
  //             }
  //             if (plan === "PLAN001") {
  //               premiumPlan.push(ele);
  //             }
  //             if (plan === "PLAN002") {
  //               goldPlan.push(ele);
  //             }
  //           });

  //           // data.map((ele) => {
  //           //     const { plan, count } = ele
  //           //     // "plan::", plan);
  //           //     if (plan === "PLAN000") {
  //           //         // data.filter
  //           //         // freePlan.push(data.filter(filt => filt.plan === ele))
  //           //     }
  //           //     setSubScriptionAnalysisArr.push({
  //           //         name: plan,
  //           //         x: utc,
  //           //         y: parseFloat(count),
  //           //     })
  //           // })
  //         }
  //       });
  //       // setDateArr(dataArr);
  //       // setFreePlan(freePlan);
  //       // setPremiumPlan(premiumPlan);
  //       // setGoldPlan(goldPlan);
  //       // setSubScriptionAnalysis(setSubScriptionAnalysisArr);
  //     }
  //   }
  // };

  const handleRegisterUsersChange = (filterType) => {
    if (filterType === "day") {
      setFilterTitle("DAY WISE ANALYSIS");
      registeredUsersType.type = 10;
      setRegisteredUsersType(registeredUsersType);
    } else if (filterType === "week") {
      setFilterTitle("WEEK WISE ANALYSIS");
      registeredUsersType.type = 20;
      setRegisteredUsersType(registeredUsersType);
    } else if (filterType === "month") {
      setFilterTitle("MONTH WISE ANALYSIS");
      registeredUsersType.type = 30;
      setRegisteredUsersType(registeredUsersType);
    } else {
      setFilterTitle("TRUE-FRIENDS ANALYSIS");
    }

    setFilterType(filterType);
    getRegisteredUsers(filterType);
  };

  // const handleSubScriptionDateChange = (filterType) => {
  //   if (filterType === "day") {
  //     setSubScriptionTitle("DATE WISE ANALYSIS");
  //     subScriptionDataType.type = 10;
  //     setSubScriptionDataType(subScriptionDataType);
  //   } else if (filterType === "week") {
  //     setSubScriptionTitle("WEEK WISE ANALYSIS");
  //     subScriptionDataType.type = 20;
  //     setSubScriptionDataType(subScriptionDataType);
  //   } else if (filterType === "month") {
  //     setSubScriptionTitle("MONTH WISE ANALYSIS");
  //     subScriptionDataType.type = 30;
  //     setSubScriptionDataType(subScriptionDataType);
  //   } else {
  //     setFilterTitle("TRUE-FRIENDS ANALYSIS");
  //   }

  //   setSubScriptionType(filterType);
  //   getSubscriptionDateWise(filterType);
  // };

  const loadDashboardDatas = async () => {
    setPlanApiLoad(true);
    const resp = await commonService.getAll(PROFILE_URL + "/dashboard");
    if (resp && resp.meta.code === 200) {
      setPlanApiLoad(false);
      const { data } = resp;
      setDashboardData(data);
    } else {
      setPlanApiLoad(false);
    }
  };

  const getCommonDataVal = (key, value) => {
    const data = commonData[key]?.find((ele) => ele.code === value);
    return data ? data?.label : "";
  };

  return (
    <div className="container content-area relative dash_card_wrap">
      <Row>
        <Col xl={3} lg={4} md={3} sm={6} className="grid-margin stretch-card">
          <div className="card card-statistics custome_card_padding">
            <div className="card-body">
              <div className="clearfix">
                <div className="float-left">
                  <i className="mdi mdi-cube text-danger icon-lg"></i>
                </div>
                <div className="float-right">
                  <p className="mb-0 text-right text-dark">Total Payments</p>
                  <div className="fluid-container">
                    <h3 className="font-weight-medium text-right mb-0 text-dark">
                      {dashboardData?.totalRevenue}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>
        <Col xl={3} lg={4} md={3} sm={6} className="grid-margin stretch-card">
          <div className="card card-statistics custome_card_padding">
            <div className="card-body">
              <div className="clearfix">
                <div className="float-left">
                  <i className="mdi mdi-receipt text-warning icon-lg"></i>
                </div>
                <div className="float-right">
                  <p className="mb-0 text-right text-dark">Total Users</p>
                  <div className="fluid-container">
                    <h3 className="font-weight-medium text-right mb-0 text-dark">
                      {dashboardData?.totalUsers}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>
        <Col xl={3} lg={4} md={3} sm={6} className="grid-margin stretch-card">
          <div className="card card-statistics custome_card_padding">
            <div className="card-body">
              <div className="clearfix">
                <div className="float-left">
                  <i className="mdi mdi-poll-box text-success icon-lg"></i>
                </div>
                <div className="float-right">
                  <p className="mb-0 text-right text-dark">Today Users</p>
                  <div className="fluid-container">
                    <h3 className="font-weight-medium text-right mb-0 text-dark">
                      {dashboardData?.todayRegisteredUsers}
                    </h3>
                  </div>
                </div>
              </div>
              {/* <p className="text-muted mt-3 mb-0">
                <i className="mdi mdi-calendar mr-1" aria-hidden="true"></i>{" "}
                Weekly Sales
              </p> */}
            </div>
          </div>
        </Col>
        <Col xl={3} lg={4} md={3} sm={6} className="grid-margin stretch-card">
          <div className="card card-statistics custome_card_padding">
            <div className="card-body">
              <div className="clearfix">
                <div className="float-left">
                  <i className="mdi mdi-account-box-multiple text-info icon-lg"></i>
                </div>
                <div className="float-right">
                  <p className="mb-0 text-right text-dark">Employees</p>
                  <div className="fluid-container">
                    <h3 className="font-weight-medium text-right mb-0 text-dark">
                      {dashboardData?.totalStaffs}
                    </h3>
                  </div>
                </div>
              </div>
              {/* <p className="text-muted mt-3 mb-0">
                <i className="mdi mdi-reload mr-1" aria-hidden="true"></i>{" "}
                Product-wise sales{" "}
              </p> */}
            </div>
          </div>
        </Col>
        <Col xl={3} lg={4} md={3} sm={6} className="grid-margin stretch-card">
          <div className="card card-statistics custome_card_padding">
            <div className="card-body">
              {/* <Link to={IMAGE_APPROVALS_PATH}> */}
                <div className="clearfix d-flex">
                  <div className="float-left">
                    <i className="mdi  mdi-image-area text-warning icon-lg"></i>
                  </div>
                  <div className="float-right">
                    <p className="mb-0 text-right text-dark">
                      Pending Image Approvals
                    </p>
                    <div className="fluid-container">
                      <h3 className="font-weight-medium text-right mb-0 text-dark">
                        {dashboardData?.photoPendingApprovals}
                      </h3>
                    </div>
                  </div>
                </div>
              {/* </Link> */}
              {/* <p className="text-muted mt-3 mb-0">
                <i className="mdi mdi-reload mr-1" aria-hidden="true"></i>{" "}
                Product-wise sales{" "}
              </p> */}
            </div>
          </div>
        </Col>
      </Row>
      <div className="plan_title">
        <h3 id="header"> Plans </h3>
      </div>
      <Row>
        <div className="mx-auto my-5 text-center">
          {planApiLoad && <h3>Loading</h3>}
        </div>
        {!planApiLoad &&
          dashboardData?.planCount?.map((ele, ind) => (
            <Col
              key={ind}
              xl={3}
              lg={4}
              md={3}
              sm={6}
              className="grid-margin stretch-card"
            >
              <div className="card card-statistics custome_card_padding">
                <div className="card-body">
                  <div className="clearfix">
                    <div className="float-left plans_card_wrap">
                      <i className="mdi mdi-timeline-text-outline menu-icon"></i>
                    </div>
                    <div
                    // className="float-right"
                    >
                      <p className="mb-0 text-right text-dark">{ele.name}</p>
                      <div className="fluid-container">
                        <h3 className="font-weight-medium text-right mb-0 text-dark">
                          {ele?.count}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          ))}
      </Row>
      <div className="plan_title">
        <h3 id="header"> Marital Status </h3>
      </div>
      <Row>
        <div className="mx-auto my-5 text-center">
          {planApiLoad && <h3>Loading</h3>}
        </div>
        {!planApiLoad &&
          dashboardData?.maritalStatusCount?.map((ele, ind) => (
            <Col
              key={ind}
              xl={3}
              lg={4}
              md={3}
              sm={6}
              className="grid-margin stretch-card"
            >
              <div className="card card-statistics custome_card_padding">
                <div className="card-body">
                  <div className="clearfix">
                    <div className="float-left plans_card_wrap">
                      {/* <i className="mdi mdi-timeline-text-outline menu-icon"></i> */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        height="40"
                        width="40"
                        version="1.1"
                        id="Capa_1"
                        viewBox="0 0 464 464"
                        xmlSpace="preserve"
                      >
                        <g>
                          <path
                            fill="#FFEBE1"
                            d="M392,0H72c-8.837,0-16,7.164-16,16v376h56c8.837,0,16,7.164,16,16v56h264c8.837,0,16-7.164,16-16V16   C408,7.164,400.837,0,392,0z M168,56h128c4.418,0,8,3.582,8,8s-3.582,8-8,8H168c-4.418,0-8-3.582-8-8S163.582,56,168,56z M152,88   h160c4.418,0,8,3.582,8,8s-3.582,8-8,8H152c-4.418,0-8-3.582-8-8S147.582,88,152,88z M232,376c0,4.418-3.582,8-8,8h-72   c-4.418,0-8-3.582-8-8v0c0-4.418,3.582-8,8-8h72C228.418,368,232,371.582,232,376L232,376z M224,352h-72c-4.418,0-8-3.582-8-8   s3.582-8,8-8h72c4.418,0,8,3.582,8,8S228.418,352,224,352z M308,401.231c-20.862-9.958-44-34.367-44-54.675   C264,331.89,275.548,320,289.793,320c7.107,0,13.541,2.961,18.207,7.749c4.665-4.788,11.1-7.749,18.207-7.749   C340.452,320,352,331.89,352,346.556C352,366.864,328.862,391.272,308,401.231z M344,280H120c-4.418,0-8-3.582-8-8s3.582-8,8-8h224   c4.418,0,8,3.582,8,8S348.418,280,344,280z M344,248H120c-4.418,0-8-3.582-8-8s3.582-8,8-8h224c4.418,0,8,3.582,8,8   S348.418,248,344,248z M344,216H120c-4.418,0-8-3.582-8-8c0-4.418,3.582-8,8-8h224c4.418,0,8,3.582,8,8   C352,212.418,348.418,216,344,216z M344,184H120c-4.418,0-8-3.582-8-8s3.582-8,8-8h224c4.418,0,8,3.582,8,8S348.418,184,344,184z    M344,152H120c-4.418,0-8-3.582-8-8c0-4.418,3.582-8,8-8h224c4.418,0,8,3.582,8,8C352,148.418,348.418,152,344,152z"
                          />
                          <path
                            fill="#CDAAA0"
                            d="M168,72h128c4.418,0,8-3.582,8-8s-3.582-8-8-8H168c-4.418,0-8,3.582-8,8S163.582,72,168,72z"
                          />
                          <path
                            fill="#CDAAA0"
                            d="M152,104h160c4.418,0,8-3.582,8-8s-3.582-8-8-8H152c-4.418,0-8,3.582-8,8S147.582,104,152,104z"
                          />
                          <path
                            fill="#AF9691"
                            d="M344,136H120c-4.418,0-8,3.582-8,8c0,4.418,3.582,8,8,8h224c4.418,0,8-3.582,8-8   C352,139.582,348.418,136,344,136z"
                          />
                          <path
                            fill="#AF9691"
                            d="M344,168H120c-4.418,0-8,3.582-8,8s3.582,8,8,8h224c4.418,0,8-3.582,8-8S348.418,168,344,168z"
                          />
                          <path
                            fill="#AF9691"
                            d="M344,200H120c-4.418,0-8,3.582-8,8c0,4.418,3.582,8,8,8h224c4.418,0,8-3.582,8-8   C352,203.582,348.418,200,344,200z"
                          />
                          <path
                            fill="#AF9691"
                            d="M344,232H120c-4.418,0-8,3.582-8,8s3.582,8,8,8h224c4.418,0,8-3.582,8-8S348.418,232,344,232z"
                          />
                          <path
                            fill="#AF9691"
                            d="M344,264H120c-4.418,0-8,3.582-8,8s3.582,8,8,8h224c4.418,0,8-3.582,8-8S348.418,264,344,264z"
                          />
                          <path
                            fill="#AF9691"
                            d="M224,336h-72c-4.418,0-8,3.582-8,8s3.582,8,8,8h72c4.418,0,8-3.582,8-8S228.418,336,224,336z"
                          />
                          <path d="M224,368h-72c-4.418,0-8,3.582-8,8v0c0,4.418,3.582,8,8,8h72c4.418,0,8-3.582,8-8v0   C232,371.582,228.418,368,224,368z" />
                          <path
                            fill="#AF9691"
                            d="M326.207,320c-7.107,0-13.541,2.961-18.207,7.749c-4.665-4.788-11.1-7.749-18.207-7.749   C275.548,320,264,331.89,264,346.556c0,20.308,23.138,44.716,44,54.675c20.862-9.958,44-34.367,44-54.675   C352,331.89,340.452,320,326.207,320z"
                          />
                          <path
                            fill="#AF9691"
                            d="M112,392H56l72,72v-56C128,399.164,120.837,392,112,392z"
                          />
                        </g>
                      </svg>
                    </div>
                    <div
                    // className="float-right"
                    >
                      <p className="mb-0 text-right text-dark">
                        {getCommonDataVal("maritalStatus", ele.maritalStatus)}
                      </p>
                      <div className="fluid-container">
                        <h3 className="font-weight-medium text-right mb-0 text-dark">
                          {ele?.count}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          ))}
      </Row>
      <Row>
        <Col md={12} className="mb-2">
          <div className="flex">
            <h3 id="header"> Profile Registration </h3>
            <ul className="list-group list-group-horizontal">
              <li
                className={
                  "list-group-item " + (filterType === "day" ? "active" : "")
                }
                onClick={() => handleRegisterUsersChange("day")}
              >
                Day
              </li>
              <li
                className={
                  "list-group-item " + (filterType === "week" ? "active" : "")
                }
                onClick={() => handleRegisterUsersChange("week")}
              >
                Week
              </li>
              <li
                className={
                  "list-group-item " + (filterType === "month" ? "active" : "")
                }
                onClick={() => handleRegisterUsersChange("month")}
              >
                Month
              </li>
            </ul>
          </div>
        </Col>
        <Col md={12}>
          <HighchartsReact highcharts={Highcharts} options={registerUsers} />
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={6}>
          <HighchartsReact
            highcharts={Highcharts}
            options={usersSubScription}
          />
        </Col>
      </Row>

      {/* Expiring Subscriptions Widget */}
      <Row className="mt-4">
        <Col md={12}>
          <ExpiringSubscriptionsWidget />
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    commonData: state?.common?.commonData,
    user: state?.account?.authUser,
  };
};

export default connect(mapStateToProps, null)(Dashboard);

// const usersSubScriptionDateWise = {
//   chart: {
//     type: "column",
//   },
//   title: {
//     text: subScriptionTitle,
//   },
//   xAxis: {
//     type: "datetime",
//     crosshair: true,
//     title: {
//       text: filterType,
//     },
//     categories: [dateArr],
//   },
//   yAxis: {
//     min: 0,
//     title: {
//       text: "Amount",
//     },
//   },
//   tooltip: {
//     // headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
//     // pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
//     //     '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
//     // footerFormat: '</table>',
//     shared: true,
//     useHTML: true,
//     // formatter: function () {
//     //     subscriptionAnalysis.map((ele) => {
//     //         return '<b>' + ele.x + '</b><br/>' +
//     //             ele.name + ': ' + ele.y + '<br/>' +
//     //             'Total: ' + ele.point.stackTotal;
//     //     })
//     // }
//   },
//   // legend: {
//   //     reversed: false
//   // },
//   plotOptions: {
//     // column: {
//     //   // pointPadding: 0.2,
//     //   // borderWidth: 0,
//     //   stacking: "normal",
//     // },
//     column: {
//       pointPadding: 0.2,
//       borderWidth: 0,
//     },
//     series: {
//       borderColor: "#303030",
//     },
//   },
//   series: [
//     {
//       name: "Plan0001",
//       data: [113, 122.5, 95],
//       stack: "North America",
//     },
//   ],
//   exporting: {
//     buttons: {
//       contextButton: {
//         menuItems: ["downloadPNG", "downloadJPEG"],
//       },
//     },
//   },
// };
