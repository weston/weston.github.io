class StatisticTracker {
    constructor() {
        this.isEditMode = false;
        this.profiles = this.loadProfiles();
        this.currentProfileId = this.loadCurrentProfileId();
        this.config = this.loadConfig();
        this.currentEditItem = null;
        this.currentEditGroup = null;
        this.draggedElement = null;
        this.isReorderMode = false;
        this.draggedProfileItem = null;
        this.reorderPlaceholder = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProfileSelector();
        this.render();
        this.updateModeDisplay();
        this.renderNotes();
    }

    loadProfiles() {
        const saved = localStorage.getItem('manualHudV2Profiles');
        if (saved) {
            const profiles = JSON.parse(saved);

            // Ensure backward compatibility: add notes, notesCollapsed, and order fields if missing
            let maxOrder = 0;
            Object.values(profiles).forEach(profile => {
                if (profile.notes === undefined) {
                    profile.notes = '';
                }
                if (profile.notesCollapsed === undefined) {
                    profile.notesCollapsed = false;
                }
                if (profile.order === undefined) {
                    // Assign order based on existing order or use a high number
                    profile.order = maxOrder++;
                } else {
                    maxOrder = Math.max(maxOrder, profile.order + 1);
                }
            });

            // Update the default profile to use the new layout if it exists
            if (profiles.default) {
                profiles.default.config = this.getDefaultConfig();
            }

            return profiles;
        }

        // Default profiles
        return {
            'default': {
                id: 'default',
                name: 'Default',
                config: this.getDefaultConfig(),
                notes: '',
                notesCollapsed: false,
                order: 0
            }
        };
    }

    loadCurrentProfileId() {
        return localStorage.getItem('manualHudV2CurrentProfile') || 'default';
    }

    saveCurrentProfileId() {
        localStorage.setItem('manualHudV2CurrentProfile', this.currentProfileId);
    }

    loadConfig() {
        const profile = this.profiles[this.currentProfileId];
        if (profile) {
            return profile.config;
        }
        return this.getDefaultConfig();
    }

    getDefaultConfig() {
        return {
            groups: [
                {
                    id: 'group1',
                    title: 'Preflop IP',
                    color: '#3498db',
                    buttons: [
                        { id: 'btn1', label: 'RFI', numerator: 0, color: '#3498db', size: 'medium' },
                        { id: 'btn2', label: 'Limp', numerator: 0, color: '#3498db', size: 'medium' },
                        { id: 'btn3', label: 'Fold', numerator: 0, color: '#3498db', size: 'medium' }
                    ]
                },
                {
                    id: 'group2',
                    title: 'Preflop OOP',
                    color: '#27ae60',
                    buttons: [
                        { id: 'btn4', label: '3b', numerator: 0, color: '#27ae60', size: 'medium' },
                        { id: 'btn5', label: 'Call', numerator: 0, color: '#27ae60', size: 'medium' },
                        { id: 'btn6', label: 'Fold', numerator: 0, color: '#27ae60', size: 'medium' }
                    ]
                },
                {
                    id: 'group3',
                    title: 'Flop IP',
                    color: '#e67e22',
                    buttons: [
                        { id: 'btn7', label: 'Cbet', numerator: 0, color: '#e67e22', size: 'medium' },
                        { id: 'btn8', label: 'XB', numerator: 0, color: '#e67e22', size: 'medium' }
                    ]
                }
            ]
        };
    }

    saveConfig() {
        // Save current profile's config
        if (this.profiles[this.currentProfileId]) {
            this.profiles[this.currentProfileId].config = this.config;
            this.saveProfiles();
        }
    }

    saveProfiles() {
        localStorage.setItem('manualHudV2Profiles', JSON.stringify(this.profiles));
    }

    setupEventListeners() {
        // Mode toggle
        document.getElementById('modeToggle').addEventListener('click', () => {
            this.toggleEditMode();
        });

        // Add group button
        document.getElementById('addGroupBtn').addEventListener('click', () => {
            this.addNewGroup();
        });

        // Profile controls
        document.getElementById('profileSelect').addEventListener('change', (e) => {
            this.switchProfile(e.target.value);
        });

        document.getElementById('newProfileBtn').addEventListener('click', () => {
            this.showNewProfileModal();
        });

        document.getElementById('deleteProfileBtn').addEventListener('click', () => {
            this.deleteProfile();
        });

        document.getElementById('reorderProfilesBtn').addEventListener('click', () => {
            this.toggleReorderMode();
        });

        // New profile modal
        document.getElementById('closeNewProfileModal').addEventListener('click', () => {
            this.closeNewProfileModal();
        });

        document.getElementById('cancelNewProfile').addEventListener('click', () => {
            this.closeNewProfileModal();
        });

        document.getElementById('newProfileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewProfile();
        });

        // Export and import
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportProfiles();
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importProfiles(e.target.files[0]);
        });

        // Notes textarea event listener
        document.getElementById('notesTextarea').addEventListener('input', (e) => {
            this.saveNotes(e.target.value);
        });

        // Notes toggle button
        document.getElementById('notesHeader').addEventListener('click', () => {
            this.toggleNotes();
        });

        // Modal event listeners
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeEditModal();
        });

        document.getElementById('closeGroupModal').addEventListener('click', () => {
            this.closeGroupModal();
        });

        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.closeEditModal();
        });

        document.getElementById('cancelGroupEdit').addEventListener('click', () => {
            this.closeGroupModal();
        });

        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditItem();
        });

        document.getElementById('groupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditGroup();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeEditModal();
                this.closeGroupModal();
            }
        });

        // Drag and drop event listeners
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('stat-button') || e.target.classList.contains('button-group')) {
                this.draggedElement = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            } else if (e.target.classList.contains('reorder-item') || e.target.closest('.reorder-item')) {
                const item = e.target.classList.contains('reorder-item') ? e.target : e.target.closest('.reorder-item');
                this.draggedProfileItem = item;
                item.classList.add('dragging');
                // Make dragged item semi-transparent
                item.style.opacity = '0.5';
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('dragging')) {
                e.target.classList.remove('dragging');
                e.target.style.opacity = '';
                this.draggedElement = null;
            }
            if (this.draggedProfileItem) {
                this.draggedProfileItem.classList.remove('dragging');
                this.draggedProfileItem.style.opacity = '';
                // Remove all drag-related classes
                document.querySelectorAll('.reorder-item').forEach(item => {
                    item.classList.remove('drop-target', 'drag-over', 'drag-over-above');
                    item.style.marginTop = '';
                    item.style.marginBottom = '';
                });
                // Remove placeholder if it exists
                if (this.reorderPlaceholder && this.reorderPlaceholder.parentNode) {
                    this.reorderPlaceholder.parentNode.removeChild(this.reorderPlaceholder);
                }
                this.reorderPlaceholder = null;
                this.draggedProfileItem = null;
            }
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dropZone = e.target.closest('.drop-zone');
            const buttonGroup = e.target.closest('.button-group');
            const statButton = e.target.closest('.stat-button');
            const reorderItem = e.target.closest('.reorder-item');
            const reorderList = document.getElementById('reorderList');

            if (dropZone) {
                dropZone.classList.add('active');
            }

            // Highlight button groups for group reordering
            if (buttonGroup && this.draggedElement && this.draggedElement.classList.contains('button-group')) {
                buttonGroup.classList.add('drop-target');
            }

            // Highlight buttons for button reordering
            if (statButton && this.draggedElement && this.draggedElement.classList.contains('stat-button')) {
                statButton.classList.add('drop-target');
            }

            // Handle profile reordering with visual feedback
            if (reorderItem && this.draggedProfileItem && reorderItem !== this.draggedProfileItem && reorderList) {
                this.handleProfileReorderDragOver(e, reorderItem, reorderList);
            }
        });

        document.addEventListener('dragleave', (e) => {
            const dropZone = e.target.closest('.drop-zone');
            const buttonGroup = e.target.closest('.button-group');
            const statButton = e.target.closest('.stat-button');
            const reorderItem = e.target.closest('.reorder-item');

            if (dropZone) {
                dropZone.classList.remove('active');
            }

            if (buttonGroup) {
                buttonGroup.classList.remove('drop-target');
            }

            if (statButton) {
                statButton.classList.remove('drop-target');
            }

            if (reorderItem) {
                reorderItem.classList.remove('drop-target', 'drag-over', 'drag-over-above');
                reorderItem.style.marginTop = '';
                reorderItem.style.marginBottom = '';
            }
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            const dropZone = e.target.closest('.drop-zone');
            const buttonGroup = e.target.closest('.button-group');
            const statButton = e.target.closest('.stat-button');
            const reorderItem = e.target.closest('.reorder-item');
            const reorderList = e.target.closest('#reorderList');

            if (dropZone && this.draggedElement) {
                this.handleDrop(dropZone, this.draggedElement);
                dropZone.classList.remove('active');
            } else if (buttonGroup && this.draggedElement && this.draggedElement.classList.contains('button-group')) {
                this.handleGroupDrop(buttonGroup, this.draggedElement);
                buttonGroup.classList.remove('drop-target');
            } else if (statButton && this.draggedElement && this.draggedElement.classList.contains('stat-button')) {
                this.handleButtonDrop(statButton, this.draggedElement);
                statButton.classList.remove('drop-target');
            } else if (this.draggedProfileItem) {
                if (reorderItem && reorderItem !== this.draggedProfileItem) {
                    this.handleProfileReorderDrop(reorderItem, this.draggedProfileItem);
                    reorderItem.classList.remove('drop-target', 'drag-over', 'drag-over-above');
                } else if (reorderList && this.reorderPlaceholder) {
                    // Drop on the list container itself - use placeholder position
                    this.handleProfileReorderDrop(null, this.draggedProfileItem);
                }
            }
        });
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        if (!this.isEditMode) {
            // Exit reorder mode when exiting edit mode
            this.isReorderMode = false;
            this.updateReorderList();
        }
        this.updateModeDisplay();
        this.render();
    }

    updateModeDisplay() {
        const toggleBtn = document.getElementById('modeToggle');
        const addGroupBtn = document.getElementById('addGroupBtn');

        if (this.isEditMode) {
            toggleBtn.textContent = 'Done';
            toggleBtn.classList.add('edit-mode');
            addGroupBtn.style.display = 'flex';
            document.body.classList.add('edit-mode');
        } else {
            toggleBtn.textContent = 'Edit';
            toggleBtn.classList.remove('edit-mode');
            addGroupBtn.style.display = 'none';
            document.body.classList.remove('edit-mode');
        }
    }

    render() {
        const container = document.getElementById('buttonGroups');
        container.innerHTML = '';

        this.config.groups.forEach(group => {
            const groupElement = this.createGroupElement(group);
            container.appendChild(groupElement);
        });

        this.renderNotes();
    }

    renderNotes() {
        const notesSection = document.getElementById('notesSection');
        const notesTextarea = document.getElementById('notesTextarea');
        const notesToggle = document.getElementById('notesToggle');
        
        if (this.currentProfileId && this.profiles[this.currentProfileId]) {
            const profile = this.profiles[this.currentProfileId];
            // Ensure notes field exists (backward compatibility)
            if (profile.notes === undefined) {
                profile.notes = '';
            }
            // Ensure notesCollapsed field exists (backward compatibility)
            if (profile.notesCollapsed === undefined) {
                profile.notesCollapsed = false;
            }
            notesTextarea.value = profile.notes || '';
            notesSection.style.display = 'block';
            
            // Set collapsed state
            if (profile.notesCollapsed) {
                notesSection.classList.add('collapsed');
                notesToggle.textContent = '▶';
            } else {
                notesSection.classList.remove('collapsed');
                notesToggle.textContent = '▼';
            }
        } else {
            notesSection.style.display = 'none';
        }
    }

    toggleNotes() {
        const notesSection = document.getElementById('notesSection');
        const notesToggle = document.getElementById('notesToggle');
        
        if (this.currentProfileId && this.profiles[this.currentProfileId]) {
            const profile = this.profiles[this.currentProfileId];
            // Ensure notesCollapsed field exists (backward compatibility)
            if (profile.notesCollapsed === undefined) {
                profile.notesCollapsed = false;
            }
            
            profile.notesCollapsed = !profile.notesCollapsed;
            
            if (profile.notesCollapsed) {
                notesSection.classList.add('collapsed');
                notesToggle.textContent = '▶';
            } else {
                notesSection.classList.remove('collapsed');
                notesToggle.textContent = '▼';
            }
            
            this.saveProfiles();
        }
    }

    saveNotes(notes) {
        if (this.currentProfileId && this.profiles[this.currentProfileId]) {
            this.profiles[this.currentProfileId].notes = notes;
            this.saveProfiles();
        }
    }

    createGroupElement(group) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'button-group';
        groupDiv.draggable = this.isEditMode;
        groupDiv.dataset.groupId = group.id;

        const header = document.createElement('div');
        header.className = 'group-header';

        const title = document.createElement('div');
        title.className = 'group-title';
        title.textContent = group.title;

        const actions = document.createElement('div');
        actions.className = 'group-actions';

        if (this.isEditMode) {
            const editBtn = document.createElement('button');
            editBtn.className = 'action-btn';
            editBtn.textContent = '✏️';
            editBtn.onclick = () => this.editGroup(group);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn';
            deleteBtn.textContent = '🗑️';
            deleteBtn.onclick = () => this.deleteGroup(group.id);

            const addBtn = document.createElement('button');
            addBtn.className = 'action-btn';
            addBtn.textContent = '+';
            addBtn.onclick = () => this.addButtonToGroup(group.id);

            actions.appendChild(addBtn);
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
        }

        header.appendChild(title);
        header.appendChild(actions);

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'buttons-container';

        // Show buttons (same for both modes, but edit mode has drag functionality)
        group.buttons.forEach(button => {
            const buttonElement = this.createButtonElement(button, group);
            buttonsContainer.appendChild(buttonElement);
        });

        groupDiv.appendChild(header);
        groupDiv.appendChild(buttonsContainer);

        // Set group color
        groupDiv.style.borderLeft = `4px solid ${group.color}`;

        return groupDiv;
    }

    createButtonElement(button, group) {
        const buttonDiv = document.createElement('button');
        buttonDiv.className = 'stat-button';
        buttonDiv.draggable = this.isEditMode;
        buttonDiv.dataset.buttonId = button.id;
        buttonDiv.dataset.groupId = group.id;

        // Calculate percentage: 100 * numerator / sum(all numerators in group)
        const totalClicks = group.buttons.reduce((sum, btn) => sum + btn.numerator, 0);
        const percentage = totalClicks > 0
            ? ((button.numerator / totalClicks) * 100).toFixed(1)
            : '0.0';

        buttonDiv.innerHTML = `
            <div class="label">${button.label}</div>
            <div class="percentage">${percentage}%</div>
            <div class="stats">(${button.numerator}/${totalClicks})</div>
            ${this.isEditMode ? `
                <div class="edit-controls">
                    <button class="edit-btn" onclick="event.stopPropagation(); tracker.editButton('${button.id}')">✏️</button>
                    <button class="edit-btn" onclick="event.stopPropagation(); tracker.deleteButton('${button.id}')">🗑️</button>
                </div>
            ` : ''}
        `;

        // Set button color and size
        buttonDiv.style.backgroundColor = button.color;

        const sizeClasses = {
            small: 'font-size: 0.8rem; padding: 10px 8px;',
            medium: 'font-size: 0.9rem; padding: 15px 10px;',
            large: 'font-size: 1rem; padding: 20px 15px;'
        };
        buttonDiv.style.cssText += sizeClasses[button.size] || sizeClasses.medium;

        // Add click handler only in normal mode
        if (!this.isEditMode) {
            buttonDiv.addEventListener('click', () => {
                this.incrementButton(button.id);
            });
        } else {
            // In edit mode, prevent click events from interfering with drag
            buttonDiv.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        }

        return buttonDiv;
    }

    incrementButton(buttonId) {
        const group = this.config.groups.find(g => g.buttons.find(b => b.id === buttonId));
        if (group) {
            const button = group.buttons.find(b => b.id === buttonId);
            if (button) {
                // Only increment the numerator for this specific button
                button.numerator++;

                this.saveConfig();
                this.render();
            }
        }
    }

    editButton(buttonId) {
        const group = this.config.groups.find(g => g.buttons.find(b => b.id === buttonId));
        if (group) {
            const button = group.buttons.find(b => b.id === buttonId);
            if (button) {
                this.currentEditItem = button;
                this.showEditModal(button);
            }
        }
    }

    deleteButton(buttonId) {
        if (confirm('Are you sure you want to delete this button?')) {
            this.config.groups.forEach(group => {
                group.buttons = group.buttons.filter(b => b.id !== buttonId);
            });
            this.saveConfig();
            this.render();
        }
    }

    editGroup(group) {
        this.currentEditGroup = group;
        this.showGroupModal(group);
    }

    deleteGroup(groupId) {
        if (confirm('Are you sure you want to delete this group?')) {
            this.config.groups = this.config.groups.filter(g => g.id !== groupId);
            this.saveConfig();
            this.render();
        }
    }

    addButtonToGroup(groupId) {
        const group = this.config.groups.find(g => g.id === groupId);
        if (group) {
            const newButton = {
                id: 'btn_' + Date.now(),
                label: 'New Button',
                numerator: 0,
                color: group.color,
                size: 'medium'
            };
            group.buttons.push(newButton);
            this.saveConfig();
            this.render();
        }
    }

    addNewGroup() {
        const newGroup = {
            id: 'group_' + Date.now(),
            title: 'New Group',
            color: '#' + Math.floor(Math.random() * 16777215).toString(16),
            buttons: []
        };
        this.config.groups.push(newGroup);
        this.saveConfig();
        this.render();
    }

    showEditModal(button) {
        const modal = document.getElementById('editModal');
        const title = document.getElementById('modalTitle');
        const label = document.getElementById('editLabel');
        const numerator = document.getElementById('editNumerator');
        const color = document.getElementById('editColor');
        const size = document.getElementById('editSize');

        title.textContent = 'Edit Button';
        label.value = button.label;
        numerator.value = button.numerator;
        color.value = button.color;
        size.value = button.size;

        modal.style.display = 'block';
    }

    showGroupModal(group) {
        const modal = document.getElementById('groupModal');
        const title = document.getElementById('groupModalTitle');
        const groupTitle = document.getElementById('groupTitle');
        const groupColor = document.getElementById('groupColor');

        title.textContent = 'Edit Group';
        groupTitle.value = group.title;
        groupColor.value = group.color;

        modal.style.display = 'block';
    }

    closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
        this.currentEditItem = null;
    }

    closeGroupModal() {
        document.getElementById('groupModal').style.display = 'none';
        this.currentEditGroup = null;
    }

    saveEditItem() {
        if (this.currentEditItem) {
            const label = document.getElementById('editLabel').value;
            const numerator = parseInt(document.getElementById('editNumerator').value);
            const color = document.getElementById('editColor').value;
            const size = document.getElementById('editSize').value;

            this.currentEditItem.label = label;
            this.currentEditItem.numerator = numerator;
            this.currentEditItem.color = color;
            this.currentEditItem.size = size;

            this.saveConfig();
            this.render();
            this.closeEditModal();
        }
    }

    saveEditGroup() {
        if (this.currentEditGroup) {
            const title = document.getElementById('groupTitle').value;
            const color = document.getElementById('groupColor').value;

            this.currentEditGroup.title = title;
            this.currentEditGroup.color = color;

            // Update all buttons in the group to use the new color
            this.currentEditGroup.buttons.forEach(button => {
                button.color = color;
            });

            this.saveConfig();
            this.render();
            this.closeGroupModal();
        }
    }

    handleDrop(dropZone, draggedElement) {
        if (draggedElement.classList.contains('stat-button')) {
            const buttonId = draggedElement.dataset.buttonId;
            const sourceGroupId = draggedElement.dataset.groupId;
            const targetGroupId = dropZone.dataset.groupId;

            if (sourceGroupId !== targetGroupId) {
                // Moving button to different group
                const sourceGroup = this.config.groups.find(g => g.id === sourceGroupId);
                const targetGroup = this.config.groups.find(g => g.id === targetGroupId);
                const button = sourceGroup.buttons.find(b => b.id === buttonId);

                if (sourceGroup && targetGroup && button) {
                    // Remove from source group
                    sourceGroup.buttons = sourceGroup.buttons.filter(b => b.id !== buttonId);

                    // Add to target group with target group's color
                    button.color = targetGroup.color;
                    targetGroup.buttons.push(button);

                    this.saveConfig();
                    this.render();
                }
            }
        }
    }

    handleButtonDrop(targetButton, draggedButton) {
        const draggedButtonId = draggedButton.dataset.buttonId;
        const targetButtonId = targetButton.dataset.buttonId;
        const sourceGroupId = draggedButton.dataset.groupId;
        const targetGroupId = targetButton.dataset.groupId;

        // Don't do anything if dropping on the same button
        if (draggedButtonId === targetButtonId) {
            return;
        }

        if (sourceGroupId === targetGroupId) {
            // Reordering within the same group
            const group = this.config.groups.find(g => g.id === sourceGroupId);
            if (group) {
                const draggedIndex = group.buttons.findIndex(b => b.id === draggedButtonId);
                const targetIndex = group.buttons.findIndex(b => b.id === targetButtonId);

                if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
                    // Create a new array with the reordered buttons
                    const newButtons = [...group.buttons];
                    const [draggedButton] = newButtons.splice(draggedIndex, 1);
                    newButtons.splice(targetIndex, 0, draggedButton);

                    // Replace the buttons array
                    group.buttons = newButtons;

                    this.saveConfig();
                    this.render();
                }
            }
        } else {
            // Moving between groups
            const sourceGroup = this.config.groups.find(g => g.id === sourceGroupId);
            const targetGroup = this.config.groups.find(g => g.id === targetGroupId);
            const button = sourceGroup.buttons.find(b => b.id === draggedButtonId);
            const targetButtonData = targetGroup.buttons.find(b => b.id === targetButtonId);

            if (sourceGroup && targetGroup && button && targetButtonData) {
                const targetIndex = targetGroup.buttons.findIndex(b => b.id === targetButtonId);

                // Remove from source group
                sourceGroup.buttons = sourceGroup.buttons.filter(b => b.id !== draggedButtonId);

                // Add to target group at the target position
                button.color = targetGroup.color;
                targetGroup.buttons.splice(targetIndex, 0, button);

                this.saveConfig();
                this.render();
            }
        }
    }

    handleGroupDrop(targetGroup, draggedGroup) {
        const draggedGroupId = draggedGroup.dataset.groupId;
        const targetGroupId = targetGroup.dataset.groupId;

        if (draggedGroupId !== targetGroupId) {
            const groups = this.config.groups;
            const draggedIndex = groups.findIndex(g => g.id === draggedGroupId);
            const targetIndex = groups.findIndex(g => g.id === targetGroupId);

            if (draggedIndex !== -1 && targetIndex !== -1) {
                // Remove the dragged group from its current position
                const [draggedGroupData] = groups.splice(draggedIndex, 1);

                // Insert it at the target position
                groups.splice(targetIndex, 0, draggedGroupData);

                this.saveConfig();
                this.render();
            }
        }
    }



    // Utility method to generate unique IDs
    updateProfileSelector() {
        const select = document.getElementById('profileSelect');
        select.innerHTML = '<option value="">Select Profile</option>';

        // Sort profiles by order
        const sortedProfiles = Object.values(this.profiles).sort((a, b) => {
            const orderA = a.order !== undefined ? a.order : 999999;
            const orderB = b.order !== undefined ? b.order : 999999;
            return orderA - orderB;
        });

        sortedProfiles.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.id;
            option.textContent = profile.name;
            if (profile.id === this.currentProfileId) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        // Update reorder list if in reorder mode
        if (this.isReorderMode) {
            this.updateReorderList();
        }
    }

    toggleReorderMode() {
        this.isReorderMode = !this.isReorderMode;
        this.updateReorderList();
    }

    updateReorderList() {
        const reorderList = document.getElementById('reorderList');
        const reorderBtn = document.getElementById('reorderProfilesBtn');

        if (this.isReorderMode && this.isEditMode) {
            reorderList.classList.add('active');
            reorderBtn.textContent = 'Done Reordering';
            this.renderReorderList();
        } else {
            reorderList.classList.remove('active');
            reorderBtn.textContent = 'Reorder Profiles';
        }
    }

    renderReorderList() {
        const reorderList = document.getElementById('reorderList');
        reorderList.innerHTML = '';

        // Sort profiles by order
        const sortedProfiles = Object.values(this.profiles).sort((a, b) => {
            const orderA = a.order !== undefined ? a.order : 999999;
            const orderB = b.order !== undefined ? b.order : 999999;
            return orderA - orderB;
        });

        sortedProfiles.forEach(profile => {
            const item = document.createElement('div');
            item.className = 'reorder-item';
            item.draggable = true;
            item.dataset.profileId = profile.id;
            
            if (profile.id === this.currentProfileId) {
                item.classList.add('current');
            }

            item.innerHTML = `
                <span class="reorder-handle">☰</span>
                <span class="reorder-item-name">${profile.name}</span>
            `;

            reorderList.appendChild(item);
        });
    }

    handleProfileReorderDragOver(e, targetItem, reorderList) {
        const targetProfileId = targetItem.dataset.profileId;
        const draggedProfileId = this.draggedProfileItem.dataset.profileId;

        if (targetProfileId === draggedProfileId) {
            return;
        }

        // Get all items excluding the dragged one
        const allItems = Array.from(reorderList.querySelectorAll('.reorder-item:not(.dragging)'));
        const targetIndex = allItems.indexOf(targetItem);
        
        if (targetIndex === -1) {
            return;
        }

        // Determine if we're dragging above or below the target
        const rect = targetItem.getBoundingClientRect();
        const mouseY = e.clientY;
        const targetMiddle = rect.top + rect.height / 2;
        const insertAbove = mouseY < targetMiddle;

        // Calculate where the placeholder should go
        let insertPosition = insertAbove ? targetIndex : targetIndex + 1;

        // Remove placeholder if it exists
        if (this.reorderPlaceholder && this.reorderPlaceholder.parentNode) {
            const oldPosition = Array.from(reorderList.querySelectorAll('.reorder-item:not(.dragging)'))
                .indexOf(this.reorderPlaceholder.previousElementSibling);
            if (oldPosition !== -1 && oldPosition === insertPosition) {
                // Position hasn't changed, don't recreate placeholder
                return;
            }
            this.reorderPlaceholder.parentNode.removeChild(this.reorderPlaceholder);
        }

        // Create placeholder with same height as dragged item
        this.reorderPlaceholder = document.createElement('div');
        this.reorderPlaceholder.className = 'reorder-placeholder';
        const draggedRect = this.draggedProfileItem.getBoundingClientRect();
        this.reorderPlaceholder.style.height = `${draggedRect.height}px`;
        this.reorderPlaceholder.style.minHeight = `${draggedRect.height}px`;

        // Remove all drag-over classes and reset margins
        allItems.forEach(item => {
            item.classList.remove('drag-over', 'drag-over-above');
            item.style.marginTop = '';
            item.style.marginBottom = '';
        });

        // Insert placeholder at the correct position
        if (insertPosition === 0) {
            reorderList.insertBefore(this.reorderPlaceholder, allItems[0] || null);
        } else if (insertPosition >= allItems.length) {
            reorderList.appendChild(this.reorderPlaceholder);
        } else {
            reorderList.insertBefore(this.reorderPlaceholder, allItems[insertPosition]);
        }
    }

    handleProfileReorderDrop(targetItem, draggedItem) {
        const draggedProfileId = draggedItem.dataset.profileId;
        const reorderList = document.getElementById('reorderList');

        if (!this.reorderPlaceholder || !reorderList) {
            // Fallback to old method if no placeholder
            if (!targetItem) {
                return;
            }
            const targetProfileId = targetItem.dataset.profileId;
            if (targetProfileId === draggedProfileId) {
                return;
            }

            const sortedProfiles = Object.values(this.profiles).sort((a, b) => {
                const orderA = a.order !== undefined ? a.order : 999999;
                const orderB = b.order !== undefined ? b.order : 999999;
                return orderA - orderB;
            });

            const draggedIndex = sortedProfiles.findIndex(p => p.id === draggedProfileId);
            const targetIndex = sortedProfiles.findIndex(p => p.id === targetProfileId);

            if (draggedIndex === -1 || targetIndex === -1) {
                return;
            }

            const [draggedProfile] = sortedProfiles.splice(draggedIndex, 1);
            sortedProfiles.splice(targetIndex, 0, draggedProfile);

            sortedProfiles.forEach((profile, index) => {
                profile.order = index;
            });

            this.saveProfiles();
            this.updateProfileSelector();
            this.renderReorderList();
            return;
        }

        // Use placeholder position to determine new order
        const allItems = Array.from(reorderList.querySelectorAll('.reorder-item'));
        const placeholderIndex = Array.from(reorderList.children).indexOf(this.reorderPlaceholder);
        
        // Count how many reorder items come before the placeholder
        let newIndex = 0;
        for (let i = 0; i < placeholderIndex; i++) {
            if (reorderList.children[i].classList.contains('reorder-item')) {
                newIndex++;
            }
        }

        // Get sorted profiles by current order
        const sortedProfiles = Object.values(this.profiles).sort((a, b) => {
            const orderA = a.order !== undefined ? a.order : 999999;
            const orderB = b.order !== undefined ? b.order : 999999;
            return orderA - orderB;
        });

        const draggedIndex = sortedProfiles.findIndex(p => p.id === draggedProfileId);
        if (draggedIndex === -1) {
            return;
        }

        // Remove from current position
        const [draggedProfile] = sortedProfiles.splice(draggedIndex, 1);
        
        // Adjust newIndex if we're moving from before to after
        if (draggedIndex < newIndex) {
            newIndex--;
        }
        
        // Insert at new position
        sortedProfiles.splice(newIndex, 0, draggedProfile);

        // Reassign orders based on new positions
        sortedProfiles.forEach((profile, index) => {
            profile.order = index;
        });

        // Remove placeholder
        if (this.reorderPlaceholder && this.reorderPlaceholder.parentNode) {
            this.reorderPlaceholder.parentNode.removeChild(this.reorderPlaceholder);
        }
        this.reorderPlaceholder = null;

        this.saveProfiles();
        this.updateProfileSelector();
        this.renderReorderList();
    }

    switchProfile(profileId) {
        if (profileId && this.profiles[profileId]) {
            this.currentProfileId = profileId;
            this.saveCurrentProfileId();
            this.config = this.loadConfig();
            // Ensure notes and notesCollapsed fields exist (backward compatibility)
            if (this.profiles[profileId].notes === undefined) {
                this.profiles[profileId].notes = '';
            }
            if (this.profiles[profileId].notesCollapsed === undefined) {
                this.profiles[profileId].notesCollapsed = false;
            }
            if (this.profiles[profileId].order === undefined) {
                // Assign a high order number for backward compatibility
                const maxOrder = Math.max(...Object.values(this.profiles).map(p => p.order !== undefined ? p.order : -1), -1);
                this.profiles[profileId].order = maxOrder + 1;
            }
            if (this.isReorderMode) {
                this.renderReorderList();
            }
            this.render();
        }
    }

    showNewProfileModal() {
        const modal = document.getElementById('newProfileModal');
        const copySelect = document.getElementById('copyFromProfile');

        // Populate copy from dropdown
        copySelect.innerHTML = '<option value="">No copy - Start fresh</option>';
        Object.values(this.profiles).forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.id;
            option.textContent = profile.name;
            copySelect.appendChild(option);
        });

        modal.style.display = 'block';
    }

    closeNewProfileModal() {
        document.getElementById('newProfileModal').style.display = 'none';
        document.getElementById('profileName').value = '';
        document.getElementById('copyFromProfile').value = '';
    }

    createNewProfile() {
        const name = document.getElementById('profileName').value.trim();
        const copyFromId = document.getElementById('copyFromProfile').value;

        if (!name) return;

        const newProfileId = 'profile_' + Date.now();
        let config;

        if (copyFromId && this.profiles[copyFromId]) {
            // Copy layout but reset stats
            config = JSON.parse(JSON.stringify(this.profiles[copyFromId].config));
            // Reset all numerators to 0
            config.groups.forEach(group => {
                group.buttons.forEach(button => {
                    button.numerator = 0;
                });
            });
        } else {
            // Start with default config
            config = this.getDefaultConfig();
        }

        // Get the maximum order to add new profile at the end
        const maxOrder = Math.max(...Object.values(this.profiles).map(p => p.order !== undefined ? p.order : -1), -1);

        this.profiles[newProfileId] = {
            id: newProfileId,
            name: name,
            config: config,
            notes: '',
            notesCollapsed: false,
            order: maxOrder + 1
        };

        this.saveProfiles();
        this.currentProfileId = newProfileId;
        this.saveCurrentProfileId();
        this.config = config;

        this.updateProfileSelector();
        this.render();
        this.closeNewProfileModal();
    }

    deleteProfile() {
        // Check if there's a profile selected
        if (!this.currentProfileId || !this.profiles[this.currentProfileId]) {
            alert('Please select a profile to delete.');
            return;
        }

        const profileToDelete = this.profiles[this.currentProfileId];
        const profileCount = Object.keys(this.profiles).length;

        // Prevent deleting the last profile
        if (profileCount <= 1) {
            alert('Cannot delete the last profile. Please create another profile first.');
            return;
        }

        // Confirm deletion
        const confirmMessage = `Are you sure you want to delete the profile "${profileToDelete.name}"?\n\nThis action cannot be undone.`;
        if (!confirm(confirmMessage)) {
            return;
        }

        // Delete the profile
        delete this.profiles[this.currentProfileId];

        // Switch to another profile (prefer default, otherwise first available)
        const remainingProfiles = Object.keys(this.profiles);
        if (remainingProfiles.length > 0) {
            if (this.profiles['default']) {
                this.currentProfileId = 'default';
            } else {
                this.currentProfileId = remainingProfiles[0];
            }
            this.saveCurrentProfileId();
            this.config = this.loadConfig();
        } else {
            // This shouldn't happen due to the check above, but handle it just in case
            this.currentProfileId = null;
            this.config = this.getDefaultConfig();
        }

        this.saveProfiles();
        this.updateProfileSelector();
        this.render();
    }

    exportProfiles() {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            profiles: this.profiles,
            currentProfileId: this.currentProfileId
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `manual-hud-v2-profiles-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(link.href);
    }

    importProfiles(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);

                // Validate the import data
                if (!importData.profiles || typeof importData.profiles !== 'object') {
                    alert('Invalid file format. Please select a valid export file.');
                    return;
                }

                // Check if we should merge or replace
                const existingProfileCount = Object.keys(this.profiles).length;
                const importProfileCount = Object.keys(importData.profiles).length;

                let message = `Import ${importProfileCount} profile(s)?\n\n`;
                if (existingProfileCount > 0) {
                    message += 'This will replace all existing profiles.';
                }

                if (confirm(message)) {
                    this.profiles = importData.profiles;
                    
                    // Ensure backward compatibility: add notes, notesCollapsed, and order fields if missing
                    let maxOrder = 0;
                    Object.values(this.profiles).forEach(profile => {
                        if (profile.notes === undefined) {
                            profile.notes = '';
                        }
                        if (profile.notesCollapsed === undefined) {
                            profile.notesCollapsed = false;
                        }
                        if (profile.order === undefined) {
                            profile.order = maxOrder++;
                        } else {
                            maxOrder = Math.max(maxOrder, profile.order + 1);
                        }
                    });
                    
                    this.currentProfileId = importData.currentProfileId || Object.keys(importData.profiles)[0];

                    this.saveProfiles();
                    this.saveCurrentProfileId();
                    this.config = this.loadConfig();

                    this.updateProfileSelector();
                    this.render();

                    alert(`Successfully imported ${importProfileCount} profile(s)!`);
                }
            } catch (error) {
                alert('Error reading file. Please make sure it\'s a valid export file.');
                console.error('Import error:', error);
            }
        };

        reader.readAsText(file);

        // Reset the file input
        document.getElementById('importFile').value = '';
    }

    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize the tracker when the page loads
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new StatisticTracker();
}); 