angular.module('fm')
  .factory('ChartService', function() {

    function draw3DDonut(cId, data, options) {
      options = options || {};
      //customize color pattern
      Highcharts.setOptions({
        colors: ["#FFEA5D", "#97EE5B", "#5B8CFB", "#ED6559", "#B067FD", "#F5AE5E", "#5E5BF2", "#CC51A8"]
      })
      let chartData = {
        credits: false,
        chart: {
            type: 'pie',
            style: {
              fontFamily: '"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans","Liberation Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"'
            },
            options3d: {
                enabled: true,
                alpha: 20
            },
            backgroundColor: '#3b38d1'
        },
        title: {
          text: options.title || '',
          widthAdjust: -560,
          align: "center",
          verticalAlign: "middle",
          y: 55
        },
        subtitle: {
            text: options.subTitle || "Summary of Monthly Budgeted Expenses",
            style: {
                color: "#fff",
                fontSize: "1.7rem",
                fontWeight: "bolder"
            }
        },
        plotOptions: {
          pie: {
              depth: 45,
              innerSize: 250,
              depth: 114,
              size: 340,
              startAngle: -65,
              dataLabels: {
                style: {
                  fontSize: "16px"
                }
              }
          },
          series: {
            dataLabels: {
                enabled: !0,
                color: "red"
            }
          }
        },
        series: [{
            name: 'Percentage',
            data: []
        }]
      }
      _.each(data, (row,i) => {
        chartData.series[0].data.push([
          `<span style='stroke-width:0;fill:#fff;font-size: 0.8rem; text-align: center'>${row[0]}-<span style='fill: orange;'>${row[3]}</span>: <span style='fill: #6AD7BB;'>${row[1]}</span> </span>`,
          row[2]
        ])
      })
      
      Highcharts.chart(cId, chartData);
    }

    function drawProgress(cId, percentage, options) {
      options = options || {};
      if(!options.standard) {
        options.standard = 32;
      }
      let chartData = {
        chart: {
          type: 'bar',
          height: 180,
          backgroundColor: 'transparent',
          events: {
            render() {
              let ren = this.renderer;
              let el = this.series[1].data[0];
              let distX = this.xAxis[0].toPixels(el.x)
              let distY = this.yAxis[0].toPixels(options.standard)-1;
              
              if (this.customTarget) {
                this.customTarget.destroy();
                this.customTarget = undefined;
              }
              this.customTarget = this.renderer.g('customTarget').attr({
                zIndex: 20
              }).add()
      
              ren.path(['M', distY, distX-18 , 'L', distY, distX+17]).attr({
                fill: '#076e96',
                stroke: '#076e96',
                'stroke-width': 3
              }).add(this.customTarget);

              // draw star 
              const startY = this.yAxis[0].toPixels(percentage) - 10;

              ren.path(['M',9.5, 14.25,'l',-5.584,2.936,1.066,-6.218,'L',.465,6.564,'l',6.243,-.907,
                'L',9.5, 0,'l',2.792,5.657,6.243,.907,-4.517,4.404,1.066, 6.218])
                .attr({
                  fill: 'white',
                  stroke: 'white',
                  'stroke-width': 1,
                  transform: 'translate(' + (startY) + ',' + (distX-10) + ')',
                })
                .add(this.customTarget);
              //draw line 
              ren.path(['M', startY + 10, distX + 7, 'L', startY+10, distX + 35]).attr({
                fill: 'white',
                stroke: 'white',
                'stroke-width': 2
              })
              .add(this.customTarget)
              
              let xBox = startY - 10;
              let yBox = distX + 30;
              if (percentage<5) {
                xBox = startY+2;
              }else if(percentage>95) {
                xBox = startY-50;
              }

              //draw rect for text 
              ren.rect(xBox, yBox, 70, 30, 5).attr({
                fill: 'white',
                stroke: 'white',
                'stroke-width': 1
              })
              .add(this.customTarget)
            
              //draw text 
              ren.text(`${percentage}%`, xBox + 35, yBox + 20).attr({
                fill: '#93c608',
                'font-size': '17px',
                'font-weight': 'bold',
                'align': 'center'
              })
              .add(this.customTarget)
              
            }
          }
        },  
        title: {
          text: options.title || '',
          align: 'center',
          margin: 0,
          useHTML: true,
          style: {
            'background-color': '#93c608',
            'font-size': '20px',
            'font-weight': 'bold',
            'color': 'white',
            'border-radius': '5px',
            'padding': '5px 10px'
          }
        },
        subtitle: {
          text: options.subTitle || '',
          verticalAlign: "bottom",
          /* y: 10 */
        },
        credits: false,
        legend: false,
        tooltip: {
          enabled:false
        },
        plotOptions: {
          bar: {
            stacking: 'normal',
            borderWidth: 0,
            borderRadius: 3
          },
          series: {
            pointWidth: 30
          }
        },
        xAxis: {
          visible: false
        },
        yAxis: {
          visible: true,
          min: 0,
          max: 100,
          title: {
            text: null
          },
          gridLineWidth: 0,
          labels: {
            format: '{value}%',            
            y: 25,
            style: {
              fontSize: '17px',
              color: '#076e96'
            }
          },
          opposite: true,
          tickPositions: [0, 10, options.standard, 100]
        },
        series: [
         {
          name: "Fill",
          data: [100],
          color: "red",
          grouping: false,
          enableMouseTracking: false, //disable tooltip on just this data element
        },
        {
          name: "Percentage",
          data: [options.standard||32],
          color: "#93c608",
          dataLabels: {
            enabled: false
          }
        }]
        
      }
      
      console.log(chartData);
      Highcharts.chart(cId, chartData)
    }
    return {
      draw3DDonut,
      drawProgress
    }

  });