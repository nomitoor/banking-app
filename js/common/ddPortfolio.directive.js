(function () {
  'use strict';

  angular
    .module('fm')
    .directive('ddPortfolio', ddPortfolio);

  ddPortfolio.$inject = [];
  function ddPortfolio() {
    return {
      restrict: 'E',
      template: `
      <div class="input-group">
        <div class="flex-grow-1">
          <ui-select ng-model='ddModel[ddSubModel]' ng-change='vm.ddChange(ddModel[ddSubModel])' reset-search-input='false' name="uiSelectPorfolio" style="min-width:180px;">
            <ui-select-match placeholder="Select Porfolio" allow-clear="true">
                {{ $select.selected.name }}
            </ui-select-match>
            <ui-select-choices repeat='porfolio.id as porfolio in vm.portfolios | filter: $select.search'>
                <div ng-bind-html='porfolio.name | highlight: $select.search'></div> 
            </ui-select-choices>  
          </ui-select>
        </div>
        <div class="input-group-append">
          <button class="btn btn-success" type="button" ng-click="vm.newPortfolio={};vm.showAddModal=true">
            <i class="material-icons">add</i>
          </button>
          <button class="btn btn-info" type="button" ng-if="vm.hasEdit && vm.selected" ng-click="vm.showUpdate(ddModel[ddSubModel])">
            <i class="material-icons">edit</i>
          </button>
          <button class="btn btn-danger" type="button" ng-if="vm.hasDelete && vm.selected" ng-click="vm.onDelete(ddModel[ddSubModel])">
            <i class="material-icons">delete</i>
          </button>
        </div>

        <!--modal -->
        <div class="modal d-block" ng-if="vm.showAddModal">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Add new Portfolio</h5>
                <button type="button" class="close" ng-click="vm.showAddModal=false">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="mb-3 form-group row">
                  <label class="col-sm-4 col-form-label">Portfolio Name<span class="text-danger">*</span></label>
                  <div class="col-sm-8">
                  <input type="text" class="form-control" ng-model="vm.newPortfolio.name" required auto-focus="true">
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" ng-click="vm.showAddModal=false">Cancel</button>
                <button type="button" class="btn btn-success" ng-disabled="!vm.newPortfolio.name || vm.isLoading" ng-click="vm.onAddNew(vm.newPortfolio)">
                  <i class="material-icons">add</i>
                  Add
                </button>  
                </div>
              </div>
            </div>
          </div>
        </div>
        <!--edit modal -->
        <div class="modal d-block" ng-if="vm.showEditModal">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Update Portfolio</h5>
                <button type="button" class="close" ng-click="vm.showEditModal=false">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="mb-3 form-group row">
                  <label class="col-sm-4 col-form-label">Portfolio Name<span class="text-danger">*</span></label>
                  <div class="col-sm-8">
                  <input type="text" class="form-control" ng-model="vm.editPortfolio.name" required auto-focus="true">
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" ng-click="vm.showEditModal=false">Cancel</button>
                <button type="button" class="btn btn-primary" ng-disabled="!vm.editPortfolio.name || vm.isLoading" ng-click="vm.onUpdate(vm.editPortfolio)">
                  <i class="material-icons">save</i>
                  Update
                </button>  
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-backdrop fade show" ng-if="vm.showAddModal||vm.showEditModal"></div>
      `,
      scope: {
        ddModel: "=",
        ddSubModel: '@',
        ddChange: "=",
        ddInit: '@',
        hasEdit: '@',
        hasDelete: '@',
        option: "=?"
      },
      link: (scope, element, attrs) => {   
        scope.ddModel = scope.ddModel || {}
        scope.ddSubModel = scope.ddSubModel || 'id'
        scope.option = scope.option || {}
      },
      controller: ['$scope', '$timeout', 'Portfolio', 'ToastService', 'ConfirmService', function($scope, $timeout, Portfolio, ToastService, ConfirmService) {
        var vm = this;
        
        activate();
        function activate() {
          vm.portfolios = [];
          vm.selected = null;
          vm.newPortfolio = {};
          vm.editPortfolio = {};
          vm.isLoading = false;
          vm.showEditModal = false;
          
          vm.hasEdit = $scope.hasEdit === 'false' ? false : true
          vm.hasDelete = $scope.hasDelete === 'false' ? false : true

          $scope.option = $scope.option || {}
          $scope.option.refresh = refresh;

          vm.onAddNew = onAddNew;
          vm.onDelete = onDelete;
          vm.onUpdate = onUpdate;
          vm.showUpdate = showUpdate;
          vm.ddChange = ddChange;
          
          getPortfolios();
        }

        function getPortfolios(name) {
          let query = {
            page: vm.page,
            page_size: 200,
            ordering : 'name'
          }
          
          if (name) {
            query.name = name;
          }
    
          return Portfolio.getAll(query)
            .then(({results}) => {
            vm.portfolios = results;
            const init = vm.selected || $scope.ddInit;
            if(init) {
              const found = _.find(vm.portfolios, (s => s.id==init))
              if (found) {
                $scope.ddModel[$scope.ddSubModel] = found.id
                ddChange(found.id)
              }
            }else {
              const found = _.first(vm.portfolios)
              if (found) {
                $scope.ddModel[$scope.ddSubModel] = found.id
                ddChange(found.id)
              }
            }
          }).catch(() => {
            
          })
        }
        function onAddNew(newPortfolio) {
          if(!newPortfolio.name || vm.isLoading) return;
          vm.isLoading = true;
          return Portfolio.create(newPortfolio)
            .then(({data}) => {
            vm.portfolios.unshift(data)
            $scope.ddModel[$scope.ddSubModel] = data.id
            vm.showAddModal = false;
            ToastService.success({
              title: 'Add new portfolio success',
              body: 'Your new portfolio has been added'
            })
          }).catch(() => {
            ToastService.danger({
              title: 'Failed to add new Portfolio',
              body: 'There is an error when adding new portfolio, please try again later'
            })
          }).finally(() => {
            vm.isLoading = false;
          })
        }
        function onDelete(id) {
          if (!vm.selected) return;
          let p = _.find(vm.portfolios, ['id', id]);
          if (!p) return;
          ConfirmService.show({
            content: `Do you want to delete Portfolio ${p.name} ?`
          })
            .then(()=>{
              return Portfolio.remove(id)
            })
            .then(() => {
              ToastService.success({
                title: 'Delete Portfolio',
                body: 'Your portfolio has been deleted successfully'
              })
              _.remove(vm.portfolios, ['id', id])
              if(vm.portfolios.length) {
                $scope.ddModel[$scope.ddSubModel] = vm.portfolios[0].id
              }
            })
            .catch(() => {
              ToastService.danger({
                title: 'Delete Portfolio',
                body: 'Failed to delete portfolio at the moment. Please check and try again'
              })
            })
        }
        function showUpdate(id) {
          if(!id) return;
          let p = _.find(vm.portfolios, ['id', id]);
          if (!p) return;
          this.editPortfolio = {...p}
          this.showEditModal = true;
        }

        function onUpdate (updatePortfolio) {
          if(!updatePortfolio.name || vm.isLoading) return;
          vm.isLoading = true;
          return Portfolio.update(updatePortfolio.id, updatePortfolio)
            .then(({data}) => {
              const index = _.findIndex(vm.portfolios, ['id', data.id])
              if (index<0) {
                vm.portfolios.unshift(data)
              } else {
                vm.portfolios[index] = data
              }
              $scope.ddModel[$scope.ddSubModel] = null 
              $timeout(() => {
                $scope.ddModel[$scope.ddSubModel] = data.id 
              },20)
              vm.showEditModal = false;
              ToastService.success({
                title: 'Update portfolio',
                body: 'Your portfolio has been updated'
            })
          }).catch(() => {
            ToastService.danger({
              title: 'Update portfolio',
              body: 'There is an error when updating your portfolio, please try again later'
            })
          }).finally(() => {
            vm.isLoading = false;
          })
        }
        function ddChange(id) {
          let p = _.find(vm.portfolios, ['id', id]);
          if(p) {
            vm.selected = p.id;
            if($scope.ddChange) {
              $scope.ddChange.call(undefined, p);
            }
          }
        }
        function refresh() {
          getPortfolios()
        }
      }],
      controllerAs: 'vm'
    }
  }
}) ();
  