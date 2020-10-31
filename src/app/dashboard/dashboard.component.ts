import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiFrontEndService } from '../services/api-front-end.service';
import { DataService } from '../services/data.service';
import { EncrDecrService } from '../services/encdec.service';
import * as moment from 'moment'
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexAxisChartSeries,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexGrid,
  ApexFill
} from "ng-apexcharts";

export type bookingRateChart = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

type ApexXAxis = {
  type?: "category" | "datetime" | "numeric";
  categories?: any;
  labels?: {
    style?: {
      colors?: string | string[];
      fontSize?: string;
    };
  };
};

export type semBookChart = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  colors: string[];
  legend: ApexLegend;
};

export type villageOccupancyChart = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: ApexLegend;
  fill: ApexFill;
};

declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  publicAuth: any;
  bookingRateData: any;
  bookingData: any;
  bookingDocument: any;

  @ViewChild("chart") chart: ChartComponent;
  public bookingRateChart: Partial<bookingRateChart>;
  public semBookChart: Partial<semBookChart>;
  public villageOccupancyChart: Partial<villageOccupancyChart>;

  constructor(
    private API: ApiFrontEndService,
    private DataService: DataService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private EncrDecrService: EncrDecrService,
    private fb: FormBuilder
  ) {
    this.bookingRateChart = {
      series: [1],
      chart: {
        width: 450,
        height: 320,
        type: "pie"
      },
      labels: ["Booked", "Pending"],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
    this.semBookChart = {
      series: [
        {
          name: "Number of Student",
          data: [0, 0, 0]
        }
      ],
      chart: {
        width: 350,
        height: 308,
        type: "bar",
        events: {
          click: function(chart, w, e) {
            // console.log(chart, w, e)
          }
        }
      },
      colors: [
        "#008FFB",
        "#00E396",
        "#FEB019",
      ],
      plotOptions: {
        bar: {
          columnWidth: "45%",
          distributed: true
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        show: false
      },
      grid: {
        show: false
      },
      xaxis: {
        categories: [
          ["Semester 1"],
          ["Semester 2"],
          ["Semester 3"],
        ],
        labels: {
          style: {
            colors: [
              "#008FFB",
              "#00E396",
              "#FEB019",
            ],
            fontSize: "12px"
          }
        }
      },
      yaxis: {
        "labels": {
            "formatter": function (val) {
                return val.toFixed(0)
            }
        }
    }
    };
    this.villageOccupancyChart = {
      series: [
        {
          name: "AVAILABLE",
          data: [0]
        },
        {
          name: "OCCUPIED",
          data: [0]
        },
        {
          name: "RENOVATING",
          data: [0]
        },
        {
          name: "UNAVAILABLE",
          data: [0]
        },
      ],
      chart: {
        type: "bar",
        width: 650,
        height: 308,
        stacked: true,
        stackType: "100%"
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: "bottom",
              offsetX: -10,
              offsetY: 0
            }
          }
        }
      ],
      xaxis: {
        categories: ["V1", "V2", "v3", "V4"]
      },
      fill: {
        opacity: 1
      },
      legend: {
        position: "right",
        offsetX: 0,
        offsetY: 50
      }
    };
  }

  async ngOnInit() {
    this.spinner.show();
    await this.subscribeData();
    await this.DataService.syncData('chart');
    await this.renderChart();
    await this.getBookinDocument();
    await this.getBookingHistory();
    this.spinner.hide();
  }

  async subscribeData() {
    this.DataService.currentAdminInfo.subscribe(data =>
      this.publicAuth = this.EncrDecrService.decryptObject('admin', data)
    );
    if (this.publicAuth == undefined || this.publicAuth == 'guest') {
      this.router.navigate(['/login']);
    }
  }

  /* async renderChart() {
    var data;
    var res1 = await this.API.getChartData(data = { type: "bookingRateChart" });
    this.bookingRateChart.series = [res1[0].booked, res1[0].notBook];

    var res2 = await this.API.getChartData(data = { type: "bookingRateChart" });
  } */

  async renderChart() {
    //bookRateChart
    this.DataService.currentBookingRateChartData.subscribe(
      data => {
        var res: any = data;
        this.bookingRateChart.series = [res[0].booked, res[0].notBook];
    });
    
    //semBookChart
    this.DataService.currentSemBookChartData.subscribe(
      data => {
        var res: any = data;
        this.semBookChart.series = [{
          data: [res[0].sem1Data, res[0].sem2Data, res[0].sem3Data]
        }];
    });

    //villageOccupancyChart
    var data = {
      type: "getAllVillage",
    }
    var village: any = await this.API.getRoomInfo(data);
    var villageArray = [];
    for (let i of village) {
      villageArray.push("V" + i.village.toString())
    }
    //console.log(villageArray);
    this.villageOccupancyChart.xaxis = {
      categories: villageArray
    };

    this.DataService.currentVillageOccupancyChartData.subscribe(
      data => {
        //console.log(data);
        var available: any = data[0];
        var occupied: any = data[1];
        var renovating: any = data[2];
        var unavailable: any = data[3];
        this.villageOccupancyChart.series = [
          {
            name: "AVAILABLE",
            data: available
          },
          {
            name: "OCCUPIED",
            data: occupied
          },
          {
            name: "RENOVATING",
            data: renovating
          },
          {
            name: "UNAVAILABLE",
            data: unavailable
          },
        ];
    });
    
  }

  async getBookingHistory() {
    var data;
    this.bookingData = await this.API.getBookingInfo(data = {type: "all"})
    //console.log(this.bookingData);
  }

  async getBookinDocument() {
    this.bookingDocument = await this.API.getBookingDocument(null);
  }

}
